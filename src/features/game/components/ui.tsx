import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { palette } from '@/theme/palette';

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}>;

export function RusticButton({ children, onPress, variant = 'outline', disabled, style, accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled, style]}>
      <Text style={[styles.buttonText, variant === 'filled' && styles.filledText]}>{children}</Text>
    </Pressable>
  );
}

export function AppModal({ visible, children, onRequestClose }: PropsWithChildren<{ visible: boolean; onRequestClose?: () => void }>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose} statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalPanel}>{children}</View>
      </View>
    </Modal>
  );
}

export const uiStyles = StyleSheet.create({
  modalTitle: { color: palette.text, fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  modalText: { color: palette.textMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
});

const styles = StyleSheet.create({
  button: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, borderWidth: 1,
    borderColor: palette.lineStrong, alignItems: 'center', justifyContent: 'center' },
  outline: { backgroundColor: palette.surfaceSoft },
  filled: { backgroundColor: palette.accent, borderColor: palette.accent },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: 'rgba(226, 118, 118, 0.10)', borderColor: 'rgba(226, 118, 118, 0.55)' },
  buttonText: { color: palette.text, fontSize: 15, fontWeight: '500', letterSpacing: 0.2 },
  filledText: { color: palette.ink, fontWeight: '700' },
  pressed: { opacity: 0.7 }, disabled: { opacity: 0.4 },
  modalBackdrop: { flex: 1, backgroundColor: palette.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalPanel: { backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.lineStrong, borderRadius: 18,
    padding: 22, gap: 14, width: '100%', maxWidth: 480 },
});
