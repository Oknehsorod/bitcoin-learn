import { createHash } from 'node:crypto';

export const hash160 = (buf: Buffer) =>
  createHash('ripemd160')
    .update(createHash('sha256').update(buf).digest())
    .digest();
