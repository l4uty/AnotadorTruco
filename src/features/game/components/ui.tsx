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
  modalTitle: { color: palette.cream, fontSize: 22, textAlign: 'center', marginBottom: 8 },
  modalText: { color: palette.creamMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
});

const styles = StyleSheet.create({
  button: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, borderWidth: 1,
    borderColor: palette.creamMuted, alignItems: 'center', justifyContent: 'center' },
  outline: { backgroundColor: 'rgba(32, 15, 7, 0.34)' },
  filled: { backgroundColor: palette.cream, borderColor: palette.cream },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: 'rgba(116, 45, 32, 0.25)', borderColor: palette.danger },
  buttonText: { color: palette.cream, fontSize: 15, letterSpacing: 0.2 },
  filledText: { color: palette.ink, fontWeight: '600' },
  pressed: { opacity: 0.7 }, disabled: { opacity: 0.4 },
  modalBackdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: 24 },
  modalPanel: { backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    padding: 22, gap: 14, maxWidth: 480, width: '100%', alignSelf: 'center' },
});
