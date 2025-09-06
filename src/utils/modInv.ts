import { mod } from './mod';

export const modInv = (a: bigint, n: bigint): bigint => {
  let t = 0n,
    newT = 1n;
  let r = n,
    newR = mod(a, n);

  while (newR !== 0n) {
    const q = r / newR;
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }

  if (r !== 1n) throw new Error('Not invertible');
  return mod(t, n);
};
