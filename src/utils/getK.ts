import { N } from './constants';
import { createSHA256Hmac } from './createSHA256Hmac';
import {
  bigIntToBigEndianBytes,
  fromBigEndianBytesToBigInt,
} from './bytesUtils';

export const getK = (z: bigint, e: bigint): bigint => {
  let k: Buffer = Buffer.alloc(32, 0x00),
    v: Buffer = Buffer.alloc(32, 0x01);

  if (z > N) z -= N;

  const zBytes = bigIntToBigEndianBytes(z);
  const secretBytes = bigIntToBigEndianBytes(e);

  k = createSHA256Hmac(k, [v, Buffer.from([0x00]), secretBytes, zBytes]);
  v = createSHA256Hmac(k, v);
  k = createSHA256Hmac(k, [v, Buffer.from([0x01]), secretBytes, zBytes]);
  v = createSHA256Hmac(k, v);

  while (true) {
    v = createSHA256Hmac(k, v);
    const candidate = fromBigEndianBytesToBigInt(v);
    if (candidate >= 1n && candidate < N) return candidate;
    k = createSHA256Hmac(k, Buffer.concat([v, Buffer.from([0x00])]));
    v = createSHA256Hmac(k, v);
  }
};
