import { Signature } from '../types/Signature';
import { BufferReader } from '../classes/BufferReader';

export const parseDERSignature = (derSignature: string): Signature | null => {
  let buf = new BufferReader(Buffer.from(derSignature, 'hex'));

  const prefix = buf.consumeFirstByte();

  if (prefix !== 0x30) return null;

  const signatureLength = buf.consumeFirstByte();

  if (signatureLength !== buf.getBuffer().length) return null;

  const rValueMarker = buf.consumeFirstByte();

  if (rValueMarker !== 0x02) return null;

  const rValueLength = buf.consumeFirstByte();

  if (!rValueLength) return null;

  const rValue = BigInt('0x' + buf.consume(rValueLength).toString('hex'));

  const sValueMarker = buf.consumeFirstByte();

  if (sValueMarker !== 0x02) return null;

  const sValueLength = buf.consumeFirstByte();

  if (!sValueLength) return null;

  const sValue = BigInt('0x' + buf.consume(sValueLength).toString('hex'));

  if (buf.getBuffer().length !== 0) return null;

  return {
    r: rValue,
    s: sValue,
    z: 0n,
  };
};
