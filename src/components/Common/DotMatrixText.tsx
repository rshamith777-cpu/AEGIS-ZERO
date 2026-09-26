import React, { useMemo } from 'react';

// Dot-matrix font glyph table for numbers, uppercase/lowercase letters, and common symbols (5x7 matrix)
const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['000', '000', '000', '000', '000', '000', '010'],
  ':': ['000', '010', '000', '000', '010', '000', '000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '%': ['11001', '11010', '00100', '01000', '01011', '10011', '00000'],
  '°': ['0110', '1001', '1001', '0110', '0000', '0000', '0000'],
  'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  'G': ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
  'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  ' ': ['00', '00', '00', '00', '00', '00', '00']
};

interface DotMatrixTextProps {
  text: string | number;
  size?: number; // Approximate height in px
  color?: string; // CSS color
  dotRadius?: number;
  gap?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const DotMatrixText: React.FC<DotMatrixTextProps> = ({
  text,
  size = 20,
  color = 'currentColor',
  dotRadius = 1.35,
  gap = 2,
  style,
  className
}) => {
  const str = String(text);

  const { circles, totalWidth, totalHeight } = useMemo(() => {
    const pitchX = 3.6;
    const pitchY = 3.6;
    let curX = 0;
    const dots: Array<{ cx: number; cy: number }> = [];

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || GLYPHS[' '];
      const cols = glyph[0].length;

      for (let row = 0; row < 7; row++) {
        const line = glyph[row] || '';
        for (let col = 0; col < cols; col++) {
          if (line[col] === '1') {
            dots.push({
              cx: curX + col * pitchX + 1.8,
              cy: row * pitchY + 1.8
            });
          }
        }
      }
      curX += cols * pitchX + gap;
    }

    return {
      circles: dots,
      totalWidth: Math.max(curX, 4),
      totalHeight: 7 * pitchY
    };
  }, [str, gap]);

  const scale = size / totalHeight;
  const renderedWidth = totalWidth * scale;

  return (
    <svg
      width={renderedWidth}
      height={size}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style }}
      className={className}
      aria-label={str}
    >
      {circles.map((d, idx) => (
        <circle key={idx} cx={d.cx.toFixed(2)} cy={d.cy.toFixed(2)} r={dotRadius} />
      ))}
    </svg>
  );
};
