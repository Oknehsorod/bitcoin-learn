import { FiniteElement } from '../classes/FiniteElement';

export const checkPrimes = (
  a: FiniteElement,
  b: FiniteElement,
  methodName: string,
) => {
  if (a.getPrime() !== b.getPrime())
    throw new Error(`Cannot ${methodName} two numbers in different Fields`);
};
