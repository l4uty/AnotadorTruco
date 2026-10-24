import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { palette } from '@/theme/palette';
import { GameTarget } from '../domain/types';

function TallyGroup({ count }: { count: number }) {
  const strokes = [
    [10, 9, 10, 53], [10, 9, 53, 9], [53, 9, 53, 53],
    [10, 53, 53, 53], [10, 53, 53, 9],
  ];
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64">
      {strokes.slice(0, count).map(([x1, y1, x2, y2], index) => (
        <Line key={index} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={palette.cream} strokeWidth={4} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

export function TallyStack({ score, target }: { score: number; target: GameTarget }) {
  const slotCount = target === 30 ? 6 : 3;
  return (
    <View style={styles.stack} accessibilityLabel={`${score} puntos`}>
      {Array.from({ length: slotCount }, (_, index) => {
        const count = Math.max(0, Math.min(5, score - index * 5));
        return (
          <View key={index}>
            {target === 30 && index === 3 && <View style={styles.fifteenDivider} />}
            <View style={styles.slot}>{count > 0 && <TallyGroup count={count} />}</View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  slot: { width: 66, height: 62, alignItems: 'center', justifyContent: 'center' },
  fifteenDivider: { height: 1, width: 88, marginVertical: 3, backgroundColor: palette.creamMuted, opacity: 0.72 },
});
