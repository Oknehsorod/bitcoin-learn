import { sha256 } from './sha256';

export const hashTagged = (tag: string, msg: Buffer): Buffer => {
  const tagBuf = Buffer.from(tag, 'utf-8');
  const hashedTag = sha256(tagBuf);

  return sha256(Buffer.concat([hashedTag, hashedTag, msg]));
};
