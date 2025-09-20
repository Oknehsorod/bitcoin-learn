import {
  createSchnorrSignature,
  verifySchnorrSignature,
} from './schnorrSignature';
import { getPublicKey } from './getPublicKey';
import { bigIntToBigEndianBytes } from './bytesUtils';

describe('Basic schnorr signature tests', () => {
  it('should produce correct signature', () => {
    const secret = 1n;

    const msg = Buffer.from('Nice', 'utf-8');
    const signature = createSchnorrSignature(secret, msg);

    expect(
      verifySchnorrSignature(
        bigIntToBigEndianBytes(getPublicKey(secret).x),
        msg,
        signature,
      ),
    ).toBeTruthy();
  });
});
