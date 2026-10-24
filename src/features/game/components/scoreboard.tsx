import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { Game, GameTarget, TeamId } from '../domain/types';
import { TallyStack } from './tally';
import { WoodBackground } from './wood-background';

export function Scoreboard({ game, menuOpen, onToggleMenu, onAdd, onSubtract, onRestart, onChangeMode, onHistory, onContinueToThirty }: {
  game: Game; menuOpen: boolean; onToggleMenu: () => void; onAdd: (team: TeamId) => void;
  onSubtract: (team: TeamId) => void; onRestart: () => void; onChangeMode: () => void; onHistory: () => void;
  onContinueToThirty: () => void;
}) {
  return (
    <WoodBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Truco anotador</Text>
          <View style={styles.headerControls}>
            <Text style={styles.subtitle}>{game.mode}</Text>
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
          </View>
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
          <TeamColumn id="us" game={game} onAdd={onAdd} onSubtract={onSubtract} />
          <View style={styles.centerLine} />
          <TeamColumn id="them" game={game} onAdd={onAdd} onSubtract={onSubtract} />
        </View>
        <Text style={styles.hint}>Tocá tu lado para sumar</Text>
      </SafeAreaView>
    </WoodBackground>
  );
}

function TeamColumn({ id, game, onAdd, onSubtract }: { id: TeamId; game: Game; onAdd: (team: TeamId) => void; onSubtract: (team: TeamId) => void }) {
  const team = game.teams[id];
  return (
    <View style={styles.column}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit>{team.name}</Text>
        <Text style={styles.score}>{team.score}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Sumar punto a ${team.name}`}
        onPress={() => onAdd(id)} disabled={game.status === 'won'} style={({ pressed }) => [styles.scoreArea, pressed && styles.scorePressed]}>
        <TallyStack score={team.score} target={game.target as GameTarget} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Restar punto a ${team.name}`}
        onPress={() => onSubtract(id)} disabled={game.status === 'won'}
        style={({ pressed }) => [styles.minusButton, pressed && styles.scorePressed]}>
        <Text style={styles.minus}>−</Text>
      </Pressable>
    </View>
  );
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.scorePressed]}>
      <Text style={[styles.menuText, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { height: 106, alignItems: 'center', justifyContent: 'center', zIndex: 4 },
  title: { color: palette.cream, fontSize: 19, letterSpacing: 0.4 },
  headerControls: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 }, subtitle: { color: palette.creamMuted, fontSize: 12 },
  targetSelector: { flexDirection: 'row', borderWidth: 1, borderColor: palette.line, borderRadius: 5, overflow: 'hidden' },
  targetChoice: { width: 38, height: 28, alignItems: 'center', justifyContent: 'center' }, targetSelected: { backgroundColor: palette.cream },
  targetText: { color: palette.cream, fontSize: 13 }, targetTextSelected: { color: palette.ink, fontWeight: '600' },
  menuButton: { position: 'absolute', right: 15, top: 14, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { color: palette.cream, fontSize: 25 }, menu: { position: 'absolute', right: 16, top: 58, width: 210,
    backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.line, borderRadius: 8, overflow: 'hidden' },
  menuItem: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  menuText: { color: palette.cream, fontSize: 14 }, danger: { color: palette.danger },
  teams: { flex: 1, flexDirection: 'row', paddingBottom: 4 }, centerLine: { width: 1, backgroundColor: 'rgba(24, 10, 5, 0.78)' },
  column: { flex: 1, alignItems: 'center', paddingHorizontal: 5 }, teamHeader: { height: 78, alignItems: 'center', justifyContent: 'center', width: '100%' },
  teamName: { color: palette.cream, fontSize: 20, maxWidth: '92%' }, score: { color: palette.cream, fontSize: 34, marginTop: 2 },
  scoreArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 }, scorePressed: { opacity: 0.62 },
  minusButton: { width: 64, height: 54, borderWidth: 1.5, borderColor: palette.cream, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  minus: { color: palette.cream, fontSize: 29, lineHeight: 31 }, hint: { color: palette.creamMuted, fontSize: 12, letterSpacing: 0.7, textAlign: 'center', paddingVertical: 8 },
});
