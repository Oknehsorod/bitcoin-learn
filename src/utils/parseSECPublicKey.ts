import { PublicKey } from '../types/PublicKey';
import { createS256Field } from './createS256Field';
import { FiniteElement } from '../classes/FiniteElement';
import { SEVEN, P } from './constants';
import { sqrtFromS256Field } from './sqrtFromS256Field';
import { mod } from './mod';
import { BufferReader } from '../classes/BufferReader';

export const parseSECPublicKey = (secKey: string): PublicKey => {
  const buf = new BufferReader(Buffer.from(secKey, 'hex'));

  const prefix = buf.consumeFirstByte();

  if (prefix === 0x04)
    return {
      x: BigInt('0x' + secKey.slice(2, 66)),
      y: BigInt('0x' + secKey.slice(66, 130)),
    };

  const isEven = prefix === 0x02;
  const x = createS256Field(BigInt('0x' + secKey.slice(2, 66)));
  const alpha = FiniteElement.add(FiniteElement.pow(x, 3n), SEVEN);
  const beta = sqrtFromS256Field(alpha.getValue());

  let evenBeta: FiniteElement, oddBeta: FiniteElement;

  if (mod(beta.getValue(), 2n) === 0n) {
    evenBeta = beta;
    oddBeta = createS256Field(P - beta.getValue());
  } else {
    evenBeta = createS256Field(P - beta.getValue());
    oddBeta = beta;
  }

  if (isEven) {
    return {
      x: x.getValue(),
      y: evenBeta.getValue(),
    };
  } else {
    return {
      x: x.getValue(),
      y: oddBeta.getValue(),
    };
  }
};
