import { createSignature } from './createSignature';
import { EllipticPoint } from '../../classes/EllipticCurve';
import { G } from '../constants';
import { PublicKey } from '../../types/PublicKey';
import { verifySignature } from '../verifySignature';
import { getSecretKeyFromSignaturesWithSameK } from '../getSecretKeyFromSignaturesWithSameK';

describe('Basic signature creation tests', () => {
  it('should return valid signatures', () => {
    const e = 12345n;
    const publicPointParams = EllipticPoint.multiply(G, e).getParams();
    const publicKey: PublicKey = {
      x: publicPointParams[2]?.getValue() as bigint,
      y: publicPointParams[3]?.getValue() as bigint,
    };

    const { r, s, z } = createSignature(e, 'Programming Bitcoin!', 1234567890n);
    const sig2 = createSignature(e, 'Another Message', 1234567890n);

    expect(r.toString(16)).toBe(
      '2b698a0f0a4041b77e63488ad48c23e8e8838dd1fb7520408b121697b782ef22',
    );
    expect(s.toString(16)).toBe(
      '1dbc63bfef4416705e602a7b564161167076d8b20990a0f26f316cff2cb0bc1a',
    );
    expect(z.toString(16)).toBe(
      '969f6056aa26f7d2795fd013fe88868d09c9f6aed96965016e1936ae47060d48',
    );

    expect(verifySignature(publicKey, { r, s, z })).toBe(true);

    expect(getSecretKeyFromSignaturesWithSameK({ r, s, z }, sig2)).toBe(e);
  });
});
