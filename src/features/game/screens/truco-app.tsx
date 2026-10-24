import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/palette';
import { Scoreboard } from '../components/scoreboard';
import { SetupScreen } from '../components/setup-screen';
import { AppModal, RusticButton, uiStyles } from '../components/ui';
import { WoodBackground } from '../components/wood-background';
import { HistoryModal } from '../components/history-modal';
import { gameStorage } from '../data/game-storage';
import { addPoint, continueToThirty, createGame, finishGame, restartGame, sortHistory, subtractPoint } from '../domain/game';
import { Game, GameEvent, GameMode, GameTarget, HistoryEntry, SetupValues, TeamId } from '../domain/types';

const EMPTY_EVENT: GameEvent = { type: 'none' };

export function TrucoApp() {
  const [hydrated, setHydrated] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [event, setEvent] = useState<GameEvent>(EMPTY_EVENT);
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [setupKey, setSetupKey] = useState(0);
  const [setupDefaults, setSetupDefaults] = useState<{ mode: GameMode; target: GameTarget }>({ mode: '2v2', target: 30 });

  useEffect(() => {
    Promise.all([gameStorage.loadCurrentGame(), gameStorage.loadHistory()]).then(([storedGame, storedHistory]) => {
      setGame(storedGame);
      setHistory(storedHistory);
      if (storedGame?.status === 'won' && storedGame.winner) {
        setEvent({ type: 'winner', team: storedGame.winner });
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) void gameStorage.saveCurrentGame(game);
  }, [game, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const cleanup = setInterval(() => {
      void gameStorage.loadHistory().then(setHistory);
    }, 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, [hydrated]);

  const startGame = (values: SetupValues) => {
    setGame(createGame(values));
    setEvent(EMPTY_EVENT);
  };

  const score = (team: TeamId) => {
    if (!game || menuOpen) return;
    const result = addPoint(game, team);
    setGame(result.game);
    setEvent(result.event);
  };

  const subtract = (team: TeamId) => {
    if (game) setGame(subtractPoint(game, team));
  };

  const saveFinishedGame = (finishedGame: Game) => {
    const entry = finishGame(finishedGame);
    if (!entry) return;
    setHistory((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== entry.id);
      const next = sortHistory([entry, ...withoutDuplicate]);
      void gameStorage.saveHistory(next);
      return next;
    });
  };

  const newGame = () => {
    if (game?.status === 'won') saveFinishedGame(game);
    setSetupDefaults({ mode: game?.mode ?? '2v2', target: game?.target ?? 30 });
    setGame(null);
    setEvent(EMPTY_EVENT);
    setSetupKey((key) => key + 1);
  };

  const handleContinueToThirty = () => {
    if (!game) return;
    setGame(continueToThirty(game));
    setEvent(game.mode === '3v3' && Math.max(game.teams.us.score, game.teams.them.score) >= 15
      ? { type: 'pika-pika', team: game.winner ?? 'us' }
      : EMPTY_EVENT);
  };

  const openHistory = () => {
    setHistoryOpen(true);
    void gameStorage.loadHistory().then(setHistory);
  };

  const selectMode = (mode: GameMode) => {
    setSetupDefaults({ mode, target: game?.target ?? 30 });
    setModeOpen(false);
    setGame(null);
    setEvent(EMPTY_EVENT);
    setSetupKey((key) => key + 1);
  };

  const confirmRestart = () => {
    if (game) setGame(restartGame(game));
    setRestartOpen(false);
    setMenuOpen(false);
    setEvent(EMPTY_EVENT);
  };

  const toggleFavorite = (id: string) => {
    setHistory((current) => {
      const next = sortHistory(current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
      void gameStorage.saveHistory(next);
      return next;
    });
  };

  if (!hydrated) {
    return <WoodBackground><View style={styles.loading}><ActivityIndicator color={palette.cream} /><Text style={styles.loadingText}>Preparando el anotador…</Text></View></WoodBackground>;
  }

  return (
    <View style={styles.root}>
      {game ? (
        <Scoreboard game={game} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)}
          onAdd={score} onSubtract={subtract}
          onRestart={() => { setMenuOpen(false); setRestartOpen(true); }}
          onChangeMode={() => { setMenuOpen(false); setModeOpen(true); }}
          onHistory={() => { setMenuOpen(false); openHistory(); }}
          onContinueToThirty={handleContinueToThirty} />
      ) : (
        <SetupScreen key={setupKey} initialMode={setupDefaults.mode} initialTarget={setupDefaults.target}
          onStart={startGame} onOpenHistory={openHistory} />
      )}

      <HistoryModal visible={historyOpen} entries={history} onClose={() => setHistoryOpen(false)} onToggleFavorite={toggleFavorite} />

      <AppModal visible={event.type === 'pika-pika'} onRequestClose={() => setEvent(EMPTY_EVENT)}>
        <Text style={uiStyles.modalTitle}>Mano de PIKA PIKA</Text>
        <Text style={uiStyles.modalText}>Se alcanzaron los primeros 15 puntos. La próxima mano se juega en tres cruces individuales: 1v1, 1v1 y 1v1.</Text>
        <RusticButton variant="filled" onPress={() => setEvent(EMPTY_EVENT)}>Entendido</RusticButton>
      </AppModal>

      <AppModal visible={event.type === 'winner'}>
        <Text style={uiStyles.modalTitle}>{game?.winner ? `¡Ganó ${game.teams[game.winner].name}!` : 'Partida terminada'}</Text>
        <Text style={uiStyles.modalText}>Resultado final: {game?.teams.us.score} a {game?.teams.them.score}</Text>
        {game?.target === 15 && <RusticButton variant="filled" onPress={handleContinueToThirty}>Continuar hasta 30</RusticButton>}
        <RusticButton variant={game?.target === 30 ? 'filled' : 'outline'} onPress={newGame}>Nueva partida</RusticButton>
      </AppModal>

      <AppModal visible={restartOpen} onRequestClose={() => setRestartOpen(false)}>
        <Text style={uiStyles.modalTitle}>¿Reiniciar la partida?</Text>
        <Text style={uiStyles.modalText}>Los puntos volverán a cero. Se conservarán el modo, el objetivo y los nombres.</Text>
        <View style={uiStyles.row}>
          <RusticButton style={styles.flexButton} onPress={() => setRestartOpen(false)}>Cancelar</RusticButton>
          <RusticButton style={styles.flexButton} variant="danger" onPress={confirmRestart}>Reiniciar</RusticButton>
        </View>
      </AppModal>

      <AppModal visible={modeOpen} onRequestClose={() => setModeOpen(false)}>
        <Text style={uiStyles.modalTitle}>Cambiar modo de juego</Text>
        <Text style={uiStyles.modalText}>Se reiniciarán los puntos y podrás ingresar nombres nuevos.</Text>
        <View style={styles.modeRow}>
          {(['1v1', '2v2', '3v3'] as GameMode[]).map((mode) => (
            <Pressable key={mode} onPress={() => selectMode(mode)} style={({ pressed }) => [styles.modeChoice, pressed && styles.pressed]}>
              <Text style={styles.modeText}>{mode}</Text>
            </Pressable>
          ))}
        </View>
        <RusticButton variant="ghost" onPress={() => setModeOpen(false)}>Cancelar</RusticButton>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: palette.creamMuted, fontSize: 14 }, flexButton: { flex: 1 },
  modeRow: { flexDirection: 'row', gap: 8 }, modeChoice: { flex: 1, height: 54, borderWidth: 1, borderColor: palette.creamMuted,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, modeText: { color: palette.cream, fontSize: 17 }, pressed: { opacity: 0.6 },
});
