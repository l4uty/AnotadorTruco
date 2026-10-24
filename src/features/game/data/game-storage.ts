import AsyncStorage from '@react-native-async-storage/async-storage';

import { purgeExpiredHistory, sortHistory } from '../domain/game';
import { Game, HistoryEntry } from '../domain/types';

const CURRENT_GAME_KEY = '@truco/current-game/v1';
const HISTORY_KEY = '@truco/history/v1';

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const gameStorage = {
  loadCurrentGame: () => readJson<Game>(CURRENT_GAME_KEY),
  saveCurrentGame: async (game: Game | null) => {
    if (game) await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
    else await AsyncStorage.removeItem(CURRENT_GAME_KEY);
  },
  loadHistory: async () => {
    const stored = (await readJson<HistoryEntry[]>(HISTORY_KEY)) ?? [];
    const cleaned = sortHistory(purgeExpiredHistory(stored));
    if (cleaned.length !== stored.length) {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  },
  saveHistory: (entries: HistoryEntry[]) =>
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(sortHistory(entries))),
};
