import Svg, { Line } from 'react-native-svg';

import { palette } from '@/theme/palette';
import { GameTarget } from '../domain/types';

export function TallyStack({ score, target, groupSize = 58 }: {
  score: number;
  target: GameTarget;
  groupSize?: number;
}) {
  const slotCount = target === 30 ? 6 : 3;
  const gap = Math.max(7, Math.round(groupSize * 0.13));
  const dividerGap = target === 30 ? Math.max(14, Math.round(groupSize * 0.26)) : 0;
  const canvasWidth = groupSize + 38;
  const canvasHeight = slotCount * groupSize + (slotCount - 1) * gap + dividerGap;
  const left = (canvasWidth - groupSize) / 2;
  const inset = groupSize * 0.13;
  const x1 = left + inset;
  const x2 = left + groupSize - inset;
  const strokeWidth = Math.max(3, groupSize * 0.062);

  return (
    <Svg
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      accessibilityLabel={`${score} puntos`}>
      {Array.from({ length: slotCount }, (_, index) => {
        const count = Math.max(0, Math.min(5, score - index * 5));
        const extraOffset = target === 30 && index >= 3 ? dividerGap : 0;
        const top = index * (groupSize + gap) + extraOffset;
        const y1 = top + inset;
        const y2 = top + groupSize - inset;
        const strokes = [
          [x1, y1, x1, y2],
          [x1, y1, x2, y1],
          [x2, y1, x2, y2],
          [x1, y2, x2, y2],
          [x1, y2, x2, y1],
        ];

        return strokes.slice(0, count).map(([startX, startY, endX, endY], strokeIndex) => (
          <Line
            key={`${index}-${strokeIndex}`}
            x1={startX} y1={startY} x2={endX} y2={endY}
            stroke={palette.cream} strokeWidth={strokeWidth} strokeLinecap="round" />
        ));
      })}

      {target === 30 && (
        <Line
          x1={3} x2={canvasWidth - 3}
          y1={3 * groupSize + 2.5 * gap + dividerGap / 2}
          y2={3 * groupSize + 2.5 * gap + dividerGap / 2}
          stroke={palette.creamMuted} strokeOpacity={0.72} strokeWidth={1.2} />
      )}
    </Svg>
  );
}
