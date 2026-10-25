const Jimp = require('jimp-compact');

const SIZE = 1024;
const OUTPUTS = ['assets/images/truco-icon.png', 'public/truco-icon.png'];

const palette = {
  background: [9, 10, 13],
  accent: [215, 163, 92],
  slate: [89, 98, 115],
  wood: [216, 180, 122],
  woodHighlight: [242, 212, 156],
  shadow: [55, 37, 24],
  headDark: [113, 49, 40],
  head: [207, 92, 72],
  headHighlight: [241, 149, 120],
};

function blend(base, top, alpha) {
  return base.map((channel, index) => Math.round(channel * (1 - alpha) + top[index] * alpha));
}

function distanceToSegment(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function insideCircle(x, y, centerX, centerY, radius) {
  return Math.hypot(x - centerX, y - centerY) <= radius;
}

function toRgba([red, green, blue]) {
  return Jimp.rgbaToInt(red, green, blue, 255);
}

async function generate() {
  const image = new Jimp(SIZE, SIZE, toRgba(palette.background));
  const matches = [
    [260, 750, 260, 250],
    [260, 250, 760, 250],
    [760, 250, 760, 750],
    [760, 750, 260, 750],
  ];

  image.scan(0, 0, SIZE, SIZE, function draw(x, y, index) {
    let color = palette.background;
    const amberGlow = Math.max(0, 1 - Math.hypot(x - 900, y - 80) / 650) * 0.09;
    const slateGlow = Math.max(0, 1 - Math.hypot(x - 80, y - 940) / 600) * 0.08;
    color = blend(color, palette.accent, amberGlow);
    color = blend(color, palette.slate, slateGlow);

    for (const [x1, y1, x2, y2] of matches) {
      if (distanceToSegment(x, y, x1 + 10, y1 + 12, x2 + 10, y2 + 12) <= 35) color = blend(color, palette.shadow, 0.72);
    }
    for (const [x1, y1, x2, y2] of matches) {
      if (distanceToSegment(x, y, x1, y1, x2, y2) <= 31) color = palette.wood;
      if (distanceToSegment(x, y, x1 - 5, y1 - 5, x2 - 5, y2 - 5) <= 8) color = blend(color, palette.woodHighlight, 0.78);
    }
    for (const [, , headX, headY] of matches) {
      if (insideCircle(x, y, headX, headY, 49)) color = palette.headDark;
      if (insideCircle(x, y, headX, headY, 41)) color = palette.head;
      if (insideCircle(x, y, headX - 12, headY - 12, 10)) color = blend(color, palette.headHighlight, 0.84);
    }

    this.bitmap.data[index] = color[0];
    this.bitmap.data[index + 1] = color[1];
    this.bitmap.data[index + 2] = color[2];
    this.bitmap.data[index + 3] = 255;
  });

  await Promise.all(OUTPUTS.map((output) => image.clone().writeAsync(output)));
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
