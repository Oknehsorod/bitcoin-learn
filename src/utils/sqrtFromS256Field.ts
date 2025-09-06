import { FiniteElement } from '../classes/FiniteElement';
import { P } from './constants';

export const sqrtFromS256Field = (num: bigint) => {
  const s256Field = new FiniteElement(num, P);

  return FiniteElement.pow(s256Field, (P + 1n) / 4n);
};
