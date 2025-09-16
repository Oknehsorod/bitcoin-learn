import { Signature } from '../types/Signature';
import { decodeDER, encodeDER } from './der';

describe('Basic DER signatures tests', () => {
  it('should return valid DER signature from r and s', () => {
    const signature: Signature = {
      r: BigInt(
        '0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6',
      ),
      s: BigInt(
        '0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec',
      ),
      z: 0n,
    };

    const output =
      '3045022037206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c60221008ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec';

    expect(encodeDER(signature).toString('hex')).toBe(output);

    expect(decodeDER(Buffer.from(output, 'hex'))).toEqual(signature);
  });
});
