import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { Game, TeamId } from '../domain/types';
import { AppBackground } from './app-background';
import { TallyStack } from './tally';

type ScoreboardProps = {
  game: Game;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onAdd: (team: TeamId) => void;
  onSubtract: (team: TeamId) => void;
  onEditName: (team: TeamId) => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onHistory: () => void;
  onContinueToThirty: () => void;
};

export function Scoreboard({ game, menuOpen, onToggleMenu, onAdd, onSubtract, onEditName, onRestart, onChangeMode, onHistory, onContinueToThirty }: ScoreboardProps) {
  const { width, height } = useWindowDimensions();
  const shortScreen = height < 700;
  const groupSize = Math.round(Math.min(64, Math.max(36, Math.min(width * 0.13, height / (game.target === 30 ? 15.5 : 10)))));
  const headerHeight = shortScreen ? 102 : 116;
  const teamHeaderHeight = shortScreen ? 68 : 82;

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.board, { width: Math.min(width, 700) }]}>
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
            <TeamColumn id="us" game={game} groupSize={groupSize} teamHeaderHeight={teamHeaderHeight} onAdd={onAdd} onSubtract={onSubtract} onEditName={onEditName} />
            <View style={styles.centerLine} />
            <TeamColumn id="them" game={game} groupSize={groupSize} teamHeaderHeight={teamHeaderHeight} onAdd={onAdd} onSubtract={onSubtract} onEditName={onEditName} />
          </View>
          <Text style={styles.hint}>Tocá tu lado para sumar</Text>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function TeamColumn({ id, game, groupSize, teamHeaderHeight, onAdd, onSubtract, onEditName }: {
  id: TeamId;
  game: Game;
  groupSize: number;
  teamHeaderHeight: number;
  onAdd: (team: TeamId) => void;
  onSubtract: (team: TeamId) => void;
  onEditName: (team: TeamId) => void;
}) {
  const team = game.teams[id];
  return (
    <View style={styles.column}>
      <View style={[styles.teamHeader, { height: teamHeaderHeight }]}>
        <View style={styles.nameRow}>
          <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{team.name}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Editar nombre de ${team.name}`}
            hitSlop={8} onPress={() => onEditName(id)} style={({ pressed }) => [styles.editNameButton, pressed && styles.pressed]}>
            <Text style={styles.editNameIcon}>✎</Text>
          </Pressable>
        </View>
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
  board: { flex: 1 },
  header: { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, zIndex: 4 },
  title: { color: palette.text, fontWeight: '600', letterSpacing: 0.3, lineHeight: 31 },
  targetSelector: { flexDirection: 'row', borderWidth: 1, borderColor: palette.lineStrong, borderRadius: 10, overflow: 'hidden', marginTop: 7, backgroundColor: palette.surfaceSoft },
  targetChoice: { width: 56, height: 40, alignItems: 'center', justifyContent: 'center' },
  targetSelected: { backgroundColor: palette.accent },
  targetText: { color: palette.textMuted, fontSize: 17 }, targetTextSelected: { color: palette.ink, fontWeight: '700' },
  modeLabel: { color: palette.accentBright, fontSize: 10, letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  menuButton: { position: 'absolute', right: 10, top: 3, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { color: palette.text, fontSize: 23, opacity: 0.92 },
  menu: { position: 'absolute', right: 14, top: 48, width: 210, backgroundColor: palette.panel,
    borderWidth: 1, borderColor: palette.line, borderRadius: 8, overflow: 'hidden' },
  menuItem: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  menuText: { color: palette.text, fontSize: 14 }, danger: { color: palette.danger },
  teams: { flex: 1, flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 4, gap: 8 },
  centerLine: { width: 1, backgroundColor: palette.line, marginVertical: 12 },
  column: { flex: 1, alignItems: 'center', paddingHorizontal: 4, backgroundColor: 'rgba(20, 23, 28, 0.74)', borderWidth: 1, borderColor: palette.line, borderRadius: 18 },
  teamHeader: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  nameRow: { width: '90%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  teamName: { color: palette.text, fontSize: 19, fontWeight: '500', flexShrink: 1 },
  editNameButton: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  editNameIcon: { color: palette.accentBright, fontSize: 19, lineHeight: 22 },
  score: { color: palette.accentBright, fontSize: 32, fontWeight: '600', lineHeight: 39, marginTop: 1 },
  scoreArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 14 },
  pressed: { opacity: 0.62 },
  minusButton: { width: 58, height: 48, borderWidth: 1, borderColor: palette.lineStrong, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: palette.surfaceRaised },
  minus: { color: palette.text, fontSize: 28, lineHeight: 30 },
  hint: { color: palette.textMuted, fontSize: 12, letterSpacing: 0.7, textAlign: 'center', paddingVertical: 9 },
});
