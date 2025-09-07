export const bigIntToBigEndianBytes = (secret: bigint, length = 32) =>
  Buffer.from(secret.toString(16).padStart(length * 2, '0'), 'hex');

export const fromBigEndianBytesToBigInt = (bytes: Buffer) =>
  bytes.reduce((acc, cur) => (acc << 8n) + BigInt(cur), 0n);

export const bigIntToLittleEndian = (
  num: bigint,
  byteLength: number,
): Buffer => {
  let n = BigInt(num);
  const result = Buffer.alloc(byteLength);

  for (let i = 0; i < byteLength; i++) {
    result[i] = Number(n & 0xffn);
    n >>= 8n;
  }

  if (n > 0n) {
    throw new Error(`Number too large to fit in ${byteLength} bytes`);
  }

  return result;
};

export const littleEndianToBigInt = (buf: Buffer): bigint => {
  let result = 0n;
  for (let i = buf.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(buf[i] as number);
  }
  return result;
};
