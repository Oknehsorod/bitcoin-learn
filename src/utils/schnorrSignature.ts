import { G, N, P, SEVEN } from './constants';
import { EllipticPoint } from '../classes/EllipticCurve';
import { hashTagged } from './hashTagged';
import {
  bigIntToBigEndianBytes,
  fromBigEndianBytesToBigInt,
} from './bytesUtils';
import { FiniteElement } from '../classes/FiniteElement';
import { createS256Point } from './createS256Point';
import { randomBytes } from 'node:crypto';
import { mod } from './mod';

function xorBytes(a: Buffer, b: Buffer): Buffer {
  if (a.length !== b.length) {
    throw new Error('Buffers must be the same length');
  }
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i]! ^ b[i]!;
  }
  return result;
}

export const createSchnorrSignature = (
  secret: bigint,
  msg: Buffer,
  a = randomBytes(32),
): Buffer => {
  let d = secret;
  if (d === 0n || d >= N) throw new Error('Invalid secret');

  const P = EllipticPoint.multiply(G, d);
  d = P.hasEvenY() ? d : N - d;

  let t = xorBytes(bigIntToBigEndianBytes(d), hashTagged('BIP0340/aux', a));

  let rand = hashTagged(
    'BIP0340/nonce',
    Buffer.concat([t, bigIntToBigEndianBytes(P.getX()?.getValue()!), msg]),
  );

  let k0 = mod(fromBigEndianBytesToBigInt(rand), N);

  if (k0 === 0n) throw new Error('sdaf');

  let R = EllipticPoint.multiply(G, k0);

  let k = R.hasEvenY() ? k0 : N - k0;

  let e = mod(
    fromBigEndianBytesToBigInt(
      hashTagged(
        'BIP0340/challenge',
        Buffer.concat([
          bigIntToBigEndianBytes(R.getX()?.getValue()!),
          bigIntToBigEndianBytes(P.getX()?.getValue()!),
          msg,
        ]),
      ),
    ),
    N,
  );

  return Buffer.concat([
    bigIntToBigEndianBytes(R.getX()?.getValue()!),
    bigIntToBigEndianBytes(mod(k + e * d, N)),
  ]);
};

export const verifySchnorrSignature = (
  publicKey: Buffer,
  msg: Buffer,
  signature: Buffer,
): boolean => {
  const x = fromBigEndianBytesToBigInt(publicKey);
  const xField = new FiniteElement(x, P);

  const ySqrt = FiniteElement.add(FiniteElement.pow(xField, 3n), SEVEN);

  const y = FiniteElement.pow(ySqrt, (P + 1n) / 4n);

  let yValue = y.getValue();

  if (x >= P)
    throw new Error(
      'x value in public key is not a valid coordinate because it is not less than the elliptic curve field size',
    );

  if ((yValue * yValue) % P !== (x ** 3n + 7n) % P) {
    return false;
  }

  if (yValue % 2n !== 0n) yValue = P - yValue;

  const r = signature.subarray(0, 32);
  const s = signature.subarray(32, 64);

  if (fromBigEndianBytesToBigInt(r) >= P) return false;
  if (fromBigEndianBytesToBigInt(s) >= N) return false;

  const e = new FiniteElement(
    fromBigEndianBytesToBigInt(
      hashTagged(
        'BIP0340/challenge',
        Buffer.concat([r, bigIntToBigEndianBytes(x), msg]),
      ),
    ),
    N,
  ).getValue();

  const publicKeyPoint = createS256Point(x, yValue);

  const point1 = EllipticPoint.multiply(G, fromBigEndianBytesToBigInt(s));
  const point2 = EllipticPoint.multiply(publicKeyPoint, N - e);
  const point3 = EllipticPoint.add(point1, point2);

  if (!point3.hasEvenY()) return false;

  return point3.getX()?.getValue() === fromBigEndianBytesToBigInt(r);
};
