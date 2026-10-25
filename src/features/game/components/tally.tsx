import Svg, { Circle, G, Line } from 'react-native-svg';

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
  const strokeWidth = Math.max(3, groupSize * 0.058);
  const headRadius = Math.max(3.5, strokeWidth * 1.2);

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
        const matches = [
          [x1, y1, x1, y2],
          [x1, y1, x2, y1],
          [x2, y1, x2, y2],
          [x2, y2, x1, y2],
          [x1, y2, x2, y1],
        ];

        return matches.slice(0, count).map(([startX, startY, endX, endY], matchIndex) => (
          <G key={`${index}-${matchIndex}`}>
            <Line x1={startX + 1.4} y1={startY + 1.8} x2={endX + 1.4} y2={endY + 1.8}
              stroke={palette.matchShadow} strokeOpacity={0.48} strokeWidth={strokeWidth + 1.5} strokeLinecap="round" />
            <Line x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={palette.matchWood} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={palette.matchHighlight} strokeOpacity={0.7} strokeWidth={Math.max(0.8, strokeWidth * 0.22)} strokeLinecap="round" />
            <Circle cx={endX} cy={endY} r={headRadius + 1.2} fill={palette.matchHeadDark} />
            <Circle cx={endX} cy={endY} r={headRadius} fill={palette.matchHead} />
            <Circle cx={endX - headRadius * 0.3} cy={endY - headRadius * 0.3}
              r={headRadius * 0.27} fill="#f19578" fillOpacity={0.72} />
          </G>
        ));
      })}

      {target === 30 && (
        <Line
          x1={3} x2={canvasWidth - 3}
          y1={3 * groupSize + 2.5 * gap + dividerGap / 2}
          y2={3 * groupSize + 2.5 * gap + dividerGap / 2}
          stroke={palette.lineStrong} strokeWidth={1.2} />
      )}
    </Svg>
  );
}
