import { PropsWithChildren } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { palette } from '@/theme/palette';

const woodTexture = require('@/assets/images/wood-background-v2.png');

export function WoodBackground({ children }: PropsWithChildren) {
  return (
    <ImageBackground source={woodTexture} resizeMode="cover" style={styles.background} imageStyle={styles.image}>
      <View style={styles.tint} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: palette.wood },
  image: { backgroundColor: palette.wood },
  tint: { position: 'absolute', inset: 0, backgroundColor: 'rgba(28, 12, 5, 0.08)' },
});
