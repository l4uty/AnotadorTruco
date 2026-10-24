export type GameMode = '1v1' | '2v2' | '3v3';
export type GameTarget = 15 | 30;
export type TeamId = 'us' | 'them';
export type GameStatus = 'playing' | 'won';
export type TeamState = { name: string; score: number };
export type Game = {
  id: string; startedAt: string; mode: GameMode; target: GameTarget;
  status: GameStatus; winner: TeamId | null; pikaPikaAnnounced: boolean;
  photoUri?: string | null;
  teams: Record<TeamId, TeamState>;
};
export type HistoryEntry = {
  id: string; startedAt: string; finishedAt: string; mode: GameMode;
  target: GameTarget; winner: TeamId; favorite: boolean;
  photoUri?: string | null;
  teams: Record<TeamId, TeamState>;
};
export type SetupValues = { mode: GameMode; target: GameTarget; usName: string; themName: string };
export type GameEvent =
  | { type: 'none' }
  | { type: 'pika-pika'; team: TeamId }
  | { type: 'winner'; team: TeamId };
