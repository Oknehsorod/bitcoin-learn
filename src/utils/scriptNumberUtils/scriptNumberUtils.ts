export const encodeNum = (num: number): Buffer => {
  if (num === 0) return Buffer.alloc(0); // Bitcoin uses empty buffer for 0

  let absNum = Math.abs(num);
  const isNegative = num < 0;
  const bytes: number[] = [];

  while (absNum > 0) {
    bytes.push(absNum & 0xff);
    absNum >>= 8;
  }

  // If the most significant byte has its highest bit set, we need an extra byte
  if (bytes[bytes.length - 1] as number & 0x80) {
    bytes.push(isNegative ? 0x80 : 0x00);
  } else if (isNegative) {
    if (bytes.length < 1) throw new Error('fff');
    // Otherwise, set the sign bit
    bytes[bytes.length - 1] |= 0x80;
  }

  return Buffer.from(bytes);
};

export const decodeNum = (buf: Buffer): number => {
  if (buf.length === 0) return 0;

  let result = 0;
  for (let i = 0; i < buf.length; i++) {
    result |= buf[i] << (8 * i); // little-endian
  }

  // If the most significant byte has the sign bit set
  const lastByte = buf[buf.length - 1];
  const negative = (lastByte & 0x80) !== 0;

  if (negative) {
    // Clear the sign bit from the last byte
    result &= ~(0x80 << (8 * (buf.length - 1)));
    result = -result;
  }

  return result;
};
