import { createHash } from 'node:crypto';

export const hash256 = (x: Buffer) => {
  const first = createHash('sha256').update(x).digest();
  return createHash('sha256').update(first).digest();
};

export const hash256ToBigInt = (x: Buffer): bigint => {
  return BigInt('0x' + hash256(x).toString('hex'));
};
