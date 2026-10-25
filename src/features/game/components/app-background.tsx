import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette } from '@/theme/palette';

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.background}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: palette.background, overflow: 'hidden' },
  content: { flex: 1 },
  glowTop: {
    position: 'absolute', width: 420, height: 420, borderRadius: 210, top: -290, right: -180,
    backgroundColor: palette.accent, opacity: 0.08,
  },
  glowBottom: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170, bottom: -260, left: -190,
    backgroundColor: '#596273', opacity: 0.08,
  },
});
