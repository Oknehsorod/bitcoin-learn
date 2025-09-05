export const toBytes = (secret: bigint, length = 32) =>
  Buffer.from(secret.toString(16).padStart(length * 2, '0'), 'hex');

export const fromBytes = (bytes: Buffer) =>
  bytes.reduce((acc, cur) => (acc << 8n) + BigInt(cur), 0n);
