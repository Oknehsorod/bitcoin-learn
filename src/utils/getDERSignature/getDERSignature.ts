import { Signature } from '../../types/Signature';

export const getDERSignature = ({ r, s }: Signature): string => {
  function encodeInt(num: bigint): Buffer {
    let buf = Buffer.from(num.toString(16).padStart(2, '0'), 'hex');
    while (buf.length > 1 && buf[0] === 0x00) buf = buf.subarray(1);
    if ((buf[0] as number) & 0x80)
      buf = Buffer.concat([Buffer.from([0x00]), buf]);
    return buf;
  }

  const rBin = encodeInt(r);
  const sBin = encodeInt(s);

  const rSeq = Buffer.concat([Buffer.from([0x02, rBin.length]), rBin]);
  const sSeq = Buffer.concat([Buffer.from([0x02, sBin.length]), sBin]);
  const seq = Buffer.concat([rSeq, sSeq]);

  return Buffer.concat([Buffer.from([0x30, seq.length]), seq]).toString('hex');
};
