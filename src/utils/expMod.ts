import { mod } from './mod';

export const expMod = (base: bigint, exp: bigint, modn: bigint): bigint => {
  if (exp < 0n) throw new Error('Negative exponents not supported');

  let result = 1n;
  let b = mod(base, modn);
  let e = exp;

  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % modn;
    }
    e >>= 1n;
    b = (b * b) % modn;
  }

  return result;
};
