import { EllipticPoint } from '../classes/EllipticCurve';
import { FiniteElement } from '../classes/FiniteElement';

export const N = BigInt(
  '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
);

export const GX = BigInt(
  '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
);

export const GY = BigInt(
  '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
);

export const P = BigInt(
  '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
);

export const ZERO = new FiniteElement(0n, P);
export const SEVEN = new FiniteElement(7n, P);

export const G = new EllipticPoint(
  new FiniteElement(GX, P),
  new FiniteElement(GY, P),
  ZERO,
  SEVEN,
);
