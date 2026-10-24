import { Game, GameEvent, GameTarget, HistoryEntry, SetupValues, TeamId } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function createId(now = Date.now()): string {
  return `${now}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createGame(values: SetupValues, now = new Date()): Game {
  return {
    id: createId(now.getTime()), startedAt: now.toISOString(), mode: values.mode,
    target: values.target, status: 'playing', winner: null, pikaPikaAnnounced: false, photoUri: null,
    teams: {
      us: { name: values.usName.trim() || 'Nosotros', score: 0 },
      them: { name: values.themName.trim() || 'Ellos', score: 0 },
    },
  };
}

export function addPoint(game: Game, team: TeamId): { game: Game; event: GameEvent } {
  if (game.status === 'won') return { game, event: { type: 'none' } };
  const nextScore = Math.min(game.teams[team].score + 1, game.target);
  const nextGame: Game = {
    ...game,
    teams: { ...game.teams, [team]: { ...game.teams[team], score: nextScore } },
  };
  if (nextScore >= game.target) {
    return { game: { ...nextGame, status: 'won', winner: team }, event: { type: 'winner', team } };
  }
  const pika = game.mode === '3v3' && game.target === 30 && !game.pikaPikaAnnounced && nextScore === 15;
  if (pika) {
    return { game: { ...nextGame, pikaPikaAnnounced: true }, event: { type: 'pika-pika', team } };
  }
  return { game: nextGame, event: { type: 'none' } };
}

export function subtractPoint(game: Game, team: TeamId): Game {
  if (game.status === 'won') return game;
  return {
    ...game,
    teams: { ...game.teams, [team]: { ...game.teams[team], score: Math.max(0, game.teams[team].score - 1) } },
  };
}

export function restartGame(game: Game, now = new Date()): Game {
  return {
    ...game, id: createId(now.getTime()), startedAt: now.toISOString(), status: 'playing',
    winner: null, pikaPikaAnnounced: false, photoUri: null,
    teams: { us: { ...game.teams.us, score: 0 }, them: { ...game.teams.them, score: 0 } },
  };
}

export function continueToThirty(game: Game): Game {
  const alreadyAtHalfway = Math.max(game.teams.us.score, game.teams.them.score) >= 15;
  return {
    ...game,
    target: 30,
    status: 'playing',
    winner: null,
    pikaPikaAnnounced: game.pikaPikaAnnounced || (game.mode === '3v3' && alreadyAtHalfway),
  };
}

export function finishGame(game: Game, now = new Date()): HistoryEntry | null {
  if (game.status !== 'won' || !game.winner) return null;
  return {
    id: game.id, startedAt: game.startedAt, finishedAt: now.toISOString(), mode: game.mode,
    target: game.target, winner: game.winner, favorite: false, photoUri: game.photoUri ?? null, teams: game.teams,
  };
}

export function purgeExpiredHistory(entries: HistoryEntry[], now = new Date()): HistoryEntry[] {
  const cutoff = now.getTime() - 7 * DAY_MS;
  return entries.filter((entry) => entry.favorite || new Date(entry.finishedAt).getTime() > cutoff);
}

export function sortHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime();
  });
}

export function normalizeTarget(value: number): GameTarget { return value === 30 ? 30 : 15; }
