import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { Game, TeamId } from '../domain/types';
import { TallyStack } from './tally';
import { WoodBackground } from './wood-background';

type ScoreboardProps = {
  game: Game;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onAdd: (team: TeamId) => void;
  onSubtract: (team: TeamId) => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onHistory: () => void;
  onContinueToThirty: () => void;
};

export function Scoreboard({ game, menuOpen, onToggleMenu, onAdd, onSubtract, onRestart, onChangeMode, onHistory, onContinueToThirty }: ScoreboardProps) {
  const { width, height } = useWindowDimensions();
  const shortScreen = height < 700;
  const groupSize = Math.round(Math.min(64, Math.max(36, Math.min(width * 0.13, height / (game.target === 30 ? 15.5 : 10)))));
  const headerHeight = shortScreen ? 102 : 116;
  const teamHeaderHeight = shortScreen ? 68 : 82;

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.board}>
          <View style={[styles.header, { height: headerHeight }]}>
            <Text style={[styles.title, { fontSize: Math.min(25, Math.max(19, width * 0.052)) }]}>Truco anotador</Text>
            <View style={styles.targetSelector}>
              <View style={[styles.targetChoice, game.target === 15 && styles.targetSelected]}>
                <Text style={[styles.targetText, game.target === 15 && styles.targetTextSelected]}>15</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Continuar hasta 30"
                disabled={game.target === 30} onPress={onContinueToThirty}
                style={[styles.targetChoice, game.target === 30 && styles.targetSelected]}>
                <Text style={[styles.targetText, game.target === 30 && styles.targetTextSelected]}>30</Text>
              </Pressable>
            </View>
            <Text style={styles.modeLabel}>{game.mode}</Text>

            <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú" hitSlop={10}
              onPress={onToggleMenu} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
            {menuOpen && (
              <View style={styles.menu}>
                <MenuItem label="Cambiar modo de juego" onPress={onChangeMode} />
                <MenuItem label="Historial" onPress={onHistory} />
                <MenuItem label="Reiniciar" onPress={onRestart} danger />
              </View>
            )}
          </View>

          <View style={styles.teams}>
            <TeamColumn id="us" game={game} groupSize={groupSize} teamHeaderHeight={teamHeaderHeight} onAdd={onAdd} onSubtract={onSubtract} />
            <View style={styles.centerLine} />
            <TeamColumn id="them" game={game} groupSize={groupSize} teamHeaderHeight={teamHeaderHeight} onAdd={onAdd} onSubtract={onSubtract} />
          </View>
          <Text style={styles.hint}>Tocá tu lado para sumar</Text>
        </View>
      </SafeAreaView>
    </WoodBackground>
  );
}

function TeamColumn({ id, game, groupSize, teamHeaderHeight, onAdd, onSubtract }: {
  id: TeamId;
  game: Game;
  groupSize: number;
  teamHeaderHeight: number;
  onAdd: (team: TeamId) => void;
  onSubtract: (team: TeamId) => void;
}) {
  const team = game.teams[id];
  return (
    <View style={styles.column}>
      <View style={[styles.teamHeader, { height: teamHeaderHeight }]}>
        <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{team.name}</Text>
        <Text style={styles.score}>{team.score}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Sumar punto a ${team.name}`}
        onPress={() => onAdd(id)} disabled={game.status === 'won'}
        style={({ pressed }) => [styles.scoreArea, pressed && styles.pressed]}>
        <TallyStack score={team.score} target={game.target} groupSize={groupSize} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Restar punto a ${team.name}`}
        onPress={() => onSubtract(id)} disabled={game.status === 'won'}
        style={({ pressed }) => [styles.minusButton, pressed && styles.pressed]}>
        <Text style={styles.minus}>−</Text>
      </Pressable>
    </View>
  );
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
      <Text style={[styles.menuText, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center' },
  board: { flex: 1, width: '100%', maxWidth: 700 },
  header: { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, zIndex: 4 },
  title: { color: palette.cream, letterSpacing: 0.2, lineHeight: 31 },
  targetSelector: { flexDirection: 'row', borderWidth: 1, borderColor: palette.creamMuted, borderRadius: 7, overflow: 'hidden', marginTop: 7 },
  targetChoice: { width: 53, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47, 22, 10, 0.35)' },
  targetSelected: { backgroundColor: palette.creamMuted },
  targetText: { color: palette.cream, fontSize: 17 }, targetTextSelected: { color: palette.ink },
  modeLabel: { color: palette.creamMuted, fontSize: 10, letterSpacing: 1.2, marginTop: 3, textTransform: 'uppercase' },
  menuButton: { position: 'absolute', right: 10, top: 3, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { color: palette.cream, fontSize: 23, opacity: 0.88 },
  menu: { position: 'absolute', right: 14, top: 48, width: 210, backgroundColor: palette.panel,
    borderWidth: 1, borderColor: palette.line, borderRadius: 8, overflow: 'hidden' },
  menuItem: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  menuText: { color: palette.cream, fontSize: 14 }, danger: { color: palette.danger },
  teams: { flex: 1, flexDirection: 'row', paddingBottom: 4 },
  centerLine: { width: 1.25, backgroundColor: 'rgba(25, 10, 4, 0.82)' },
  column: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  teamHeader: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  teamName: { color: palette.cream, fontSize: 19, maxWidth: '88%' },
  score: { color: palette.cream, fontSize: 32, lineHeight: 39, marginTop: 1 },
  scoreArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 14 },
  pressed: { opacity: 0.62 },
  minusButton: { width: 58, height: 52, borderWidth: 1.5, borderColor: palette.cream, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8, backgroundColor: 'rgba(45, 20, 9, 0.16)' },
  minus: { color: palette.cream, fontSize: 28, lineHeight: 30 },
  hint: { color: palette.cream, opacity: 0.88, fontSize: 12, letterSpacing: 0.7, textAlign: 'center', paddingVertical: 8 },
});
