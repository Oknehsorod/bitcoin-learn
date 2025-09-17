import { Signature } from '../types/Signature';
import { BufferReader } from '../classes/BufferReader';
import _ from 'lodash';

const DER_MARKER = Buffer.from([0x30]);
const DER_VALUE_MARKER = Buffer.from([0x02]);

const encodeInt = (num: bigint): Buffer => {
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex; // pad if odd length
  let buf = Buffer.from(hex, 'hex');

  // strip leading 0x00 if unnecessary
  while (buf.length > 1 && buf[0] === 0x00) buf = buf.subarray(1);

  // add sign byte if high bit set
  if (buf[0]! & 0x80) {
    buf = Buffer.concat([Buffer.from([0x00]), buf]);
  }

  return buf;
};

export const encodeDER = ({ r, s }: Signature): Buffer => {
  const rBin = encodeInt(r);
  const sBin = encodeInt(s);

  const rSeq = Buffer.concat([
    DER_VALUE_MARKER,
    Buffer.from([rBin.length]),
    rBin,
  ]);
  const sSeq = Buffer.concat([
    DER_VALUE_MARKER,
    Buffer.from([sBin.length]),
    sBin,
  ]);
  const seq = Buffer.concat([rSeq, sSeq]);

  return Buffer.concat([DER_MARKER, Buffer.from([seq.length]), seq]);
};

export const decodeDER = (der: Buffer): Signature | null => {
  const buf = new BufferReader(der);

  const prefix = buf.consume(1);

  if (!prefix.equals(DER_MARKER)) return null;

  const signatureLength = buf.consumeUInt8();

  if (signatureLength !== buf.getBuffer().length) return null;

  const rValueMarker = buf.consume(1);

  if (!rValueMarker.equals(DER_VALUE_MARKER)) return null;

  const rValueLength = buf.consumeUInt8();

  if (!_.isNumber(rValueLength)) return null;

  const rValue = BigInt('0x' + buf.consume(rValueLength).toString('hex'));

  const sValueMarker = buf.consume(1);

  if (!sValueMarker.equals(DER_VALUE_MARKER)) return null;

  const sValueLength = buf.consumeUInt8();

  if (!sValueLength) return null;

  const sValue = BigInt('0x' + buf.consume(sValueLength).toString('hex'));

  if (buf.getBuffer().length !== 0) return null;

  return {
    r: rValue,
    s: sValue,
    z: 0n,
  };
};
