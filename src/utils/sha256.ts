import { createHash } from 'node:crypto';

export const sha256 = (msg: Buffer) =>
  createHash('sha256').update(msg).digest();
