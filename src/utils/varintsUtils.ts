import { BufferReader } from '../classes/BufferReader';

export const readVarints = (buf: BufferReader): bigint | number => {
  const i = buf.consume(1)[0];

  if (i === 0xfd) {
    return buf.consumeUInt16LE();
  }
  if (i === 0xfe) {
    return buf.consumeUInt32LE();
  }
  if (i === 0xff) {
    return buf.consumeBigUInt64LE();
  }

  return i as number;
};

export const encodeVarints = (i: number | bigint): Buffer => {
  if (i < 0xfdn) {
    return Buffer.from([Number(i)]);
  }
  if (i <= 0xffffn) {
    const value = Buffer.alloc(2);
    value.writeUInt16LE(i as number);
    return Buffer.concat([Buffer.from([0xfd]), value]);
  }
  if (i <= 0xffffffffn) {
    const value = Buffer.alloc(4);
    value.writeUInt32LE(i as number);
    return Buffer.concat([Buffer.from([0xfe]), value]);
  }
  if (i <= 0xffffffffffffffffn) {
    const value = Buffer.alloc(8);
    value.writeBigUInt64LE(i as bigint);
    return Buffer.concat([Buffer.from([0xff]), value]);
  }
  throw new Error('Integer too large for Bitcoin VarInt');
};
