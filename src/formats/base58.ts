const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const encodeBase58 = (buf: Buffer): string => {
  let zeroCounter = 0;
  while (buf[zeroCounter] === 0) zeroCounter += 1;

  let encoding = '';
  let a = BigInt('0x' + buf.toString('hex'));
  while (a > 0n) {
    encoding = BASE58_ALPHABET[Number(a % 58n)] + encoding;
    a = a / 58n;
  }

  return '1'.repeat(zeroCounter) + encoding;
};

export const decodeBase58 = (val: string): Buffer => {
  let result = 0n;

  let zeroCounter = 0;
  while (val[zeroCounter] === '1') zeroCounter += 1;

  const a = [...val];
  a.reverse();

  a.forEach((el, idx) => {
    result += BigInt(BASE58_ALPHABET.indexOf(el)) * 58n ** BigInt(idx);
  });

  return Buffer.concat([
    Buffer.alloc(zeroCounter, 0),
    Buffer.from(result.toString(16), 'hex'),
  ]);
};
