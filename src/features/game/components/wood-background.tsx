import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { palette } from '@/theme/palette';

const grain = [
  'M-20 80 C80 48 170 112 310 76 S520 52 760 92',
  'M-30 175 C120 130 210 218 370 174 S620 145 810 188',
  'M-10 290 C90 260 230 324 390 278 S610 258 790 310',
  'M-30 420 C130 375 220 452 410 414 S640 390 830 438',
  'M-20 560 C100 525 250 592 390 552 S620 516 810 576',
  'M-40 710 C110 666 245 742 420 698 S650 675 830 728',
  'M-20 860 C120 820 255 892 420 850 S650 822 820 880',
];

export function WoodBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 800 920" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.woodDark} />
            <Stop offset="0.45" stopColor={palette.wood} />
            <Stop offset="1" stopColor="#351a0e" />
          </LinearGradient>
        </Defs>
        <Rect width="800" height="920" fill="url(#wood)" />
        {grain.map((path, index) => (
          <Path key={path} d={path} fill="none"
            stroke={index % 2 ? palette.woodHighlight : '#1f0f08'}
            strokeOpacity={index % 2 ? 0.22 : 0.32} strokeWidth={index % 2 ? 5 : 3} />
        ))}
        <Path d="M135 0 C118 240 165 510 126 920" stroke="#170b06" strokeOpacity="0.2" strokeWidth="2" fill="none" />
        <Path d="M610 0 C642 260 592 610 626 920" stroke="#a06b3d" strokeOpacity="0.16" strokeWidth="3" fill="none" />
      </Svg>
      <View style={styles.tint} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.wood },
  tint: { position: 'absolute', inset: 0, backgroundColor: 'rgba(23, 10, 4, 0.08)' },
});
