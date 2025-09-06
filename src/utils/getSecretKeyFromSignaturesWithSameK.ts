import { Signature } from '../types/Signature';
import { mod } from './mod';
import { N } from './constants';
import { modInv } from './modInv';

export const getSecretKeyFromSignaturesWithSameK = (
  { r, s: s1, z: z1 }: Signature,
  { s: s2, z: z2 }: Signature,
) => {
  const numerator = mod(s2 * z1 - s1 * z2, N);
  const denominator = mod(r * (s1 - s2), N);
  const invDen = modInv(denominator, N);
  return mod(numerator * invDen, N);
};
