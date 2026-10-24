import { CameraType, CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/palette';

type WinnerCameraProps = {
  visible: boolean;
  onCancel: () => void;
  onCapture: (uri: string) => Promise<void>;
};

export function WinnerCamera({ visible, onCancel, onCapture }: WinnerCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  if (!visible) return null;

  const takePicture = async () => {
    if (!cameraRef.current || !ready || capturing) return;
    setCapturing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        mirror: false,
        isImageMirror: false,
      });
      if (picture?.uri) await onCapture(picture.uri);
    } finally {
      setCapturing(false);
    }
  };

  const close = () => {
    if (!capturing) onCancel();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mirror={false}
          mode="picture"
          onCameraReady={() => setReady(true)}
        />

        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar cámara" onPress={close} style={styles.textButton}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </Pressable>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Foto sin espejo</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar entre cámara frontal y trasera"
            disabled={capturing}
            onPress={() => {
              setReady(false);
              setFacing((current) => current === 'back' ? 'front' : 'back');
            }}
            style={styles.textButton}>
            <Text style={styles.buttonText}>Girar cámara</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sacar foto"
            disabled={!ready || capturing}
            onPress={() => void takePicture()}
            style={({ pressed }) => [styles.shutterOuter, pressed && styles.pressed, (!ready || capturing) && styles.disabled]}>
            <View style={styles.shutterInner} />
          </Pressable>

          <View style={styles.controlSpacer} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#090503' },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 48, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  controls: {
    position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 132, paddingHorizontal: 24, paddingBottom: 30,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(9, 5, 3, 0.58)',
  },
  textButton: {
    minWidth: 108, minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
    borderRadius: 9, backgroundColor: 'rgba(20, 10, 5, 0.7)', borderWidth: 1, borderColor: palette.creamMuted,
  },
  buttonText: { color: palette.cream, fontSize: 14, fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(20, 10, 5, 0.7)' },
  badgeText: { color: palette.cream, fontSize: 12 },
  shutterOuter: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: palette.cream,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20, 10, 5, 0.3)',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: palette.cream },
  controlSpacer: { width: 108 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
});
