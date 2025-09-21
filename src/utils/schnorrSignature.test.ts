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

    expect(
      createSchnorrSignature(
        3n,
        Buffer.from(
          '0000000000000000000000000000000000000000000000000000000000000000',
          'hex',
        ),
        Buffer.from(
          '0000000000000000000000000000000000000000000000000000000000000000',
          'hex',
        ),
      ).toString('hex'),
    ).toBe(
      'E907831F80848D1069A5371B402410364BDF1C5F8307B0084C55F1CE2DCA821525F66A4A85EA8B71E482A74F382D2CE5EBEEE8FDB2172F477DF4900D310536C0'.toLowerCase(),
    );

    expect(
      createSchnorrSignature(
        0xb7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfefn,
        Buffer.from(
          '243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89',
          'hex',
        ),
        Buffer.from(
          '0000000000000000000000000000000000000000000000000000000000000001',
          'hex',
        ),
      ).toString('hex'),
    ).toBe(
      '6896BD60EEAE296DB48A229FF71DFE071BDE413E6D43F917DC8DCF8C78DE33418906D11AC976ABCCB20B091292BFF4EA897EFCB639EA871CFA95F6DE339E4B0A'.toLowerCase(),
    );

    expect(
      createSchnorrSignature(
        0xc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b14e5c9n,
        Buffer.from(
          '7E2D58D8B3BCDF1ABADEC7829054F90DDA9805AAB56C77333024B9D0A508B75C',
          'hex',
        ),
        Buffer.from(
          'C87AA53824B4D7AE2EB035A2B5BBBCCC080E76CDC6D1692C4B0B62D798E6D906',
          'hex',
        ),
      ).toString('hex'),
    ).toBe(
      '5831AAEED7B44BB74E5EAB94BA9D4294C49BCF2A60728D8B4C200F50DD313C1BAB745879A5AD954A72C45A91C3A51D3C7ADEA98D82F8481E0E1E03674A6F3FB7'.toLowerCase(),
    );
  });
});
