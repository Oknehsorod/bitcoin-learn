import { EllipticPoint } from '../classes/EllipticCurve';
import { FiniteElement } from '../classes/FiniteElement';
import { P, SEVEN, ZERO } from './constants';

export const createS256Point = (x: bigint, y: bigint): EllipticPoint =>
  new EllipticPoint(
    new FiniteElement(x, P),
    new FiniteElement(y, P),
    ZERO,
    SEVEN,
  );
