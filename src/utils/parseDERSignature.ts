import { Signature } from '../types/Signature';

export const parseDERSignature = (derSignature: string): Signature | null => {
  let buf = Buffer.from(derSignature, 'hex');

  const prefix = buf[0];

  if (prefix !== 0x30) return null;
  buf = buf.subarray(1);

  const signatureLength = buf[0];
  buf = buf.subarray(1);

  if (signatureLength !== buf.length) return null;

  const rValueMarker = buf[0];
  buf = buf.subarray(1);

  if (rValueMarker !== 0x02) return null;

  const rValueLength = buf[0];
  buf = buf.subarray(1);

  const rValue = BigInt('0x' + buf.subarray(0, rValueLength).toString('hex'));
  buf = buf.subarray(rValueLength);

  const sValueMarker = buf[0];
  buf = buf.subarray(1);

  if (sValueMarker !== 0x02) return null;

  const sValueLength = buf[0];
  buf = buf.subarray(1);

  const sValue = BigInt('0x' + buf.subarray(0, sValueLength).toString('hex'));
  buf = buf.subarray(sValueLength);

  if (buf.length !== 0) return null;

  return {
    r: rValue,
    s: sValue,
    z: 0n,
  };
};
