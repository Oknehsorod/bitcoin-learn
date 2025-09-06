import { FiniteElement } from '../classes/FiniteElement';
import { P } from './constants';

export const createS256Field = (num: bigint) => new FiniteElement(num, P);
