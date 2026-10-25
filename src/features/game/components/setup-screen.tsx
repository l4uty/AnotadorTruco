import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { GameMode, GameTarget, SetupValues } from '../domain/types';
import { AppBackground } from './app-background';
import { RusticButton } from './ui';

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
  const { width } = useWindowDimensions();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.content, { width: Math.min(Math.max(width - 60, 280), 460) }]}>
          <View style={styles.contentInner}>
            <Text style={styles.eyebrow}>ANOTADOR DE TRUCO</Text>
            <Text style={styles.title}>Preparar la partida</Text>

            <View style={styles.formCard}>
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
                  placeholderTextColor={palette.textMuted} maxLength={22} selectTextOnFocus />
                <TextInput style={styles.input} value={themName} onChangeText={setThemName} placeholder="Ellos"
                  placeholderTextColor={palette.textMuted} maxLength={22} selectTextOnFocus />
              </View>
            </View>

            <RusticButton variant="filled" onPress={() => onStart({ mode, target, usName, themName })}>Empezar partida</RusticButton>
            <RusticButton variant="ghost" onPress={onOpenHistory}>Ver historial</RusticButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
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
  safe: { flex: 1, alignItems: 'center' }, content: { flex: 1, justifyContent: 'center' },
  contentInner: { gap: 18 },
  eyebrow: { color: palette.accentBright, fontSize: 10, fontWeight: '600', letterSpacing: 2.6, textAlign: 'center' },
  title: { color: palette.text, fontSize: 28, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  formCard: { gap: 17, padding: 18, borderRadius: 18, backgroundColor: 'rgba(20, 23, 28, 0.84)', borderWidth: 1, borderColor: palette.line },
  section: { gap: 8 }, label: { color: palette.textMuted, fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },
  selector: { flexDirection: 'row', borderWidth: 1, borderColor: palette.lineStrong, borderRadius: 11, overflow: 'hidden', backgroundColor: palette.surfaceSoft },
  choice: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center' },
  choiceSelected: { backgroundColor: palette.accent }, choiceText: { color: palette.textMuted, fontSize: 16 },
  choiceTextSelected: { color: palette.ink, fontWeight: '700' },
  input: { minHeight: 48, borderWidth: 1, borderColor: palette.line, borderRadius: 11, color: palette.text,
    backgroundColor: palette.surfaceSoft, paddingHorizontal: 14, fontSize: 16 },
});
