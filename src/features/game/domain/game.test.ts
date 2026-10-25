import { describe, expect, it, vi } from 'vitest';
import { addPoint, continueToThirty, createGame, finishGame, purgeExpiredHistory, renameTeam, restartGame, sortHistory, subtractPoint } from './game';
import { Game, HistoryEntry } from './types';

vi.spyOn(Math, 'random').mockReturnValue(0.12345);
const setup = { mode: '3v3' as const, target: 30 as const, usName: 'Sur', themName: 'Norte' };
const withScore = (game: Game, us: number, them = 0): Game => ({
  ...game, teams: { us: { ...game.teams.us, score: us }, them: { ...game.teams.them, score: them } },
});

describe('reglas de la partida', () => {
  it('suma solo al equipo elegido y limita el puntaje al objetivo', () => {
    const result = addPoint(withScore(createGame({ ...setup, target: 15 }), 14, 7), 'us');
    expect(result.game.teams.us.score).toBe(15);
    expect(result.game.teams.them.score).toBe(7);
    expect(result.game.status).toBe('won');
    expect(result.event).toEqual({ type: 'winner', team: 'us' });
  });
  it('nunca resta por debajo de cero', () => {
    expect(subtractPoint(createGame(setup), 'them').teams.them.score).toBe(0);
  });
  it('edita un nombre sin modificar el puntaje y lo conserva en el historial', () => {
    const renamed = renameTeam(withScore(createGame(setup), 29, 8), 'us', '  Campeones  ');
    const won = addPoint(renamed, 'us').game;
    expect(renamed.teams.us).toEqual({ name: 'Campeones', score: 29 });
    expect(finishGame(won)?.teams.us.name).toBe('Campeones');
  });
  it('anuncia PIKA PIKA una sola vez al llegar primero a 15 en 3v3 a 30', () => {
    const first = addPoint(withScore(createGame(setup), 14), 'us');
    expect(first.event.type).toBe('pika-pika');
    const second = addPoint(subtractPoint(first.game, 'us'), 'us');
    expect(second.event.type).toBe('none');
  });
  it('continúa de 15 a 30 conservando puntos', () => {
    const won = { ...addPoint(withScore(createGame({ ...setup, target: 15 }), 14), 'us').game, photoUri: 'file:///recuerdo.jpg' };
    const continued = continueToThirty(won);
    expect(continued.target).toBe(30);
    expect(continued.teams.us.score).toBe(15);
    expect(continued.status).toBe('playing');
    expect(continued.pikaPikaAnnounced).toBe(true);
    expect(continued.photoUri).toBe('file:///recuerdo.jpg');
  });
  it('permite cambiar a 30 antes de 15 sin suprimir el futuro aviso PIKA PIKA', () => {
    const game = createGame({ ...setup, target: 15 });
    expect(continueToThirty(game).pikaPikaAnnounced).toBe(false);
  });
  it('reinicia puntos y conserva la configuración', () => {
    const game = { ...withScore(createGame(setup), 18, 12), photoUri: 'file:///recuerdo.jpg' };
    const restarted = restartGame(game, new Date('2026-10-23T20:00:00Z'));
    expect(restarted.teams.us).toEqual({ name: 'Sur', score: 0 });
    expect(restarted.teams.them).toEqual({ name: 'Norte', score: 0 });
    expect([restarted.mode, restarted.target]).toEqual(['3v3', 30]);
    expect(restarted.photoUri).toBeNull();
  });
  it('solo crea historial para una partida ganada', () => {
    expect(finishGame(createGame(setup))).toBeNull();
    const won = addPoint(withScore(createGame(setup), 29), 'us').game;
    expect(finishGame(won)?.winner).toBe('us');
  });
  it('copia la foto de recuerdo al historial', () => {
    const won = { ...addPoint(withScore(createGame(setup), 29), 'us').game, photoUri: 'file:///recuerdo.jpg' };
    expect(finishGame(won)?.photoUri).toBe('file:///recuerdo.jpg');
  });
});

describe('historial', () => {
  const base = (id: string, finishedAt: string, favorite = false): HistoryEntry => ({
    id, finishedAt, favorite, startedAt: finishedAt, mode: '2v2', target: 15, winner: 'us',
    teams: { us: { name: 'Nosotros', score: 15 }, them: { name: 'Ellos', score: 8 } },
  });
  it('elimina a los 7 días solo partidas sin estrella', () => {
    const entries = [base('old', '2026-10-15T11:59:00Z'), base('favorite', '2026-01-01T00:00:00Z', true), base('recent', '2026-10-22T12:00:00Z')];
    expect(purgeExpiredHistory(entries, new Date('2026-10-23T12:00:00Z')).map((entry) => entry.id)).toEqual(['favorite', 'recent']);
  });
  it('ordena favoritos primero y luego por fecha descendente', () => {
    const entries = [base('old', '2026-10-20T12:00:00Z'), base('favorite', '2026-10-19T12:00:00Z', true), base('new', '2026-10-22T12:00:00Z')];
    expect(sortHistory(entries).map((entry) => entry.id)).toEqual(['favorite', 'new', 'old']);
  });
});
