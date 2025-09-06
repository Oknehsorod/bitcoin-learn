import { createS256Point } from '../createS256Point';
import { G, N } from '../constants';
import { mod } from '../mod';
import { EllipticPoint } from '../../classes/EllipticCurve';
import { PublicKey } from '../../types/PublicKey';
import { Signature } from '../../types/Signature';
import { expMod } from '../expMod';

export const verifySignature = (
  { x: pX, y: pY }: PublicKey,
  { r, s, z }: Signature,
) => {
  const publicPoint = createS256Point(pX, pY);
  const sInv = expMod(s, N - 2n, N);
  const u = mod(z * sInv, N);
  const v = mod(r * sInv, N);
  const uG = EllipticPoint.multiply(G, u);
  const vP = EllipticPoint.multiply(publicPoint, v);
  const [, , x] = EllipticPoint.add(uG, vP).getParams();

  return x?.getValue() === r;
};
