import { PublicKey } from '../types/PublicKey';
import { EllipticPoint } from '../classes/EllipticCurve';
import { G } from './constants';

export const getPublicKey = (secret: bigint): PublicKey => {
  const [, , x, y] = EllipticPoint.multiply(G, secret).getParams();
  return { x: x?.getValue() as bigint, y: y?.getValue() as bigint };
};
