import { Color, Random, Utils } from '@code-not-art/core';

export function jitterColor(color: Color, rng: Random): Color {
  const hsv = color.get.hsv();

  return new Color({
    h: hsv.h,
    s: hsv.s * 100,
    v: Utils.clamp(rng.fuzzy(hsv.v * 90).float(20), { max: 100 }),
    a: hsv.a,
  });
}
