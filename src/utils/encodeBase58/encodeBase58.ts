import { divMod } from '../divMod';

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const encodeBase58 = (hex: string) => {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }

  const buf = Buffer.from(hex, 'hex');

  let zeros = 0;
  for (const b of buf) {
    if (b === 0) zeros++;
    else break;
  }

  let num = BigInt('0x' + buf.toString('hex'));

  let result = '';
  while (num > 0n) {
    const [q, r] = divMod(num, 58n);
    num = q;
    result = BASE58_ALPHABET[Number(r)] + result;
  }

  return '1'.repeat(zeros) + result;
};
