import { PublicKey } from '../types/PublicKey';
import { BufferReader } from '../classes/BufferReader';
import { createS256Field } from '../utils/createS256Field';
import { FiniteElement } from '../classes/FiniteElement';
import { sqrtFromS256Field } from '../utils/sqrtFromS256Field';
import { P, SEVEN } from '../utils/constants';
import { mod } from '../utils/mod';
import { bigIntToBigEndianBytes } from '../utils/bytesUtils';

const UNCOMPRESSED_KEY_PREFIX = Buffer.from([0x04]);
const COMPRESSED_EVEN_KEY_PREFIX = Buffer.from([0x02]);
const COMPRESSED_ODD_KEY_PREFIX = Buffer.from([0x03]);

export const encodeSEC = (
  { x, y }: PublicKey,
  isCompressed = false,
): Buffer => {
  if (!isCompressed)
    return Buffer.concat([
      UNCOMPRESSED_KEY_PREFIX,
      bigIntToBigEndianBytes(x),
      bigIntToBigEndianBytes(y),
    ]);

  if (y % 2n === 0n)
    return Buffer.concat([
      COMPRESSED_EVEN_KEY_PREFIX,
      bigIntToBigEndianBytes(x),
    ]);

  return Buffer.concat([COMPRESSED_ODD_KEY_PREFIX, bigIntToBigEndianBytes(x)]);
};

export const decodeSEC = (sec: Buffer): PublicKey => {
  const buf = new BufferReader(sec);

  const prefix = buf.consume(1);

  if (prefix.equals(UNCOMPRESSED_KEY_PREFIX))
    return {
      x: BigInt('0x' + buf.consume(32).toString('hex')),
      y: BigInt('0x' + buf.consume(32).toString('hex')),
    };

  const isEven = prefix.equals(COMPRESSED_EVEN_KEY_PREFIX);
  const x = createS256Field(BigInt('0x' + buf.consume(32).toString('hex')));
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
