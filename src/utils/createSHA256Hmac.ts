import { createHmac } from 'node:crypto';

export const createSHA256Hmac = (
  key: Buffer,
  value: Buffer | Buffer[],
): Buffer =>
  createHmac('sha256', key)
    .update(Array.isArray(value) ? Buffer.concat(value) : value)
    .digest();
