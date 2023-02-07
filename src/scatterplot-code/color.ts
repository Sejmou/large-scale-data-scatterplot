import { Color } from 'three';

const divergingColors = [
  new Color(0x7fc97f),
  new Color(0xbeaed4),
  new Color(0xfdc086),
  new Color(0xffff99),
  new Color(0x386cb0),
  new Color(0xf0027f),
  new Color(0xbf5b17),
  new Color(0x666666),
] as const;

export function getColor(categoryIdx: number) {
  const color = divergingColors[categoryIdx % divergingColors.length];
  return color;
}
