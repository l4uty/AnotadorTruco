import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { GameMode, GameTarget, SetupValues } from '../domain/types';
import { RusticButton } from './ui';
import { WoodBackground } from './wood-background';

const MODES: GameMode[] = ['1v1', '2v2', '3v3'];
const TARGETS: GameTarget[] = [15, 30];

export function SetupScreen({ initialMode = '2v2', initialTarget = 30, onStart, onOpenHistory }: {
  initialMode?: GameMode; initialTarget?: GameTarget;
  onStart: (values: SetupValues) => void; onOpenHistory: () => void;
}) {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [target, setTarget] = useState<GameTarget>(initialTarget);
  const [usName, setUsName] = useState('Nosotros');
  const [themName, setThemName] = useState('Ellos');

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
          <Text style={styles.eyebrow}>ANOTADOR DE TRUCO</Text>
          <Text style={styles.title}>Preparar la partida</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Modo de juego</Text>
            <View style={styles.selector}>
              {MODES.map((value) => <Choice key={value} label={value} selected={mode === value} onPress={() => setMode(value)} />)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Puntos</Text>
            <View style={styles.selector}>
              {TARGETS.map((value) => <Choice key={value} label={String(value)} selected={target === value} onPress={() => setTarget(value)} />)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Nombres</Text>
            <TextInput style={styles.input} value={usName} onChangeText={setUsName} placeholder="Nosotros"
              placeholderTextColor={palette.creamMuted} maxLength={22} selectTextOnFocus />
            <TextInput style={styles.input} value={themName} onChangeText={setThemName} placeholder="Ellos"
              placeholderTextColor={palette.creamMuted} maxLength={22} selectTextOnFocus />
          </View>

          <RusticButton variant="filled" onPress={() => onStart({ mode, target, usName, themName })}>Empezar partida</RusticButton>
          <RusticButton variant="ghost" onPress={onOpenHistory}>Ver historial</RusticButton>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </WoodBackground>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, gap: 18, maxWidth: 520, width: '100%', alignSelf: 'center' },
  eyebrow: { color: palette.creamMuted, fontSize: 11, letterSpacing: 2.2, textAlign: 'center' },
  title: { color: palette.cream, fontSize: 27, textAlign: 'center', marginBottom: 4 },
  section: { gap: 8 }, label: { color: palette.creamMuted, fontSize: 13 },
  selector: { flexDirection: 'row', borderWidth: 1, borderColor: palette.line, borderRadius: 8, overflow: 'hidden' },
  choice: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27, 12, 6, 0.28)' },
  choiceSelected: { backgroundColor: palette.cream }, choiceText: { color: palette.cream, fontSize: 16 },
  choiceTextSelected: { color: palette.ink, fontWeight: '600' },
  input: { minHeight: 46, borderWidth: 1, borderColor: palette.line, borderRadius: 8, color: palette.cream,
    backgroundColor: 'rgba(27, 12, 6, 0.3)', paddingHorizontal: 14, fontSize: 16 },
});
