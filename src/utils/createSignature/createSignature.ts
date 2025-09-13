import { Signature } from '../../types/Signature';
import { hash256ToBigInt } from '../hash256';
import { getK } from '../getK';
import { EllipticPoint } from '../../classes/EllipticCurve';
import { G, N } from '../constants';
import { expMod } from '../expMod';
import { mod } from '../mod';

export const createSignature = (
  secret: bigint,
  message: string | Buffer,
  _k?: bigint,
): Signature => {
  const e = secret;
  const z = Buffer.isBuffer(message)
    ? BigInt('0x' + message.toString('hex'))
    : hash256ToBigInt(Buffer.from(message));

  const k = _k ?? getK(z, e);

  const r = EllipticPoint.multiply(G, k).getParams()[2]?.getValue();

  if (!r) throw new Error('Wrong EllipticPoint');

  const kInv = expMod(k, N - 2n, N);
  let s = mod((z + r * e) * kInv, N);

  if (s > N / 2n) {
    s = N - s;
  }

  return { z, r, s };
};
