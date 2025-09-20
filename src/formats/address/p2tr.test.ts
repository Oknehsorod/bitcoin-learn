import { encodeScript } from '../script';
import { decodeP2TR, encodeP2TR } from './p2tr';
import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { bigIntToBigEndianBytes } from '../../utils/bytesUtils';
import { getPublicKey } from '../../utils/getPublicKey';

describe('Basic p2tr tests', () => {
  it('should produce correct address', () => {
    const scripts = new Array(5)
      .fill(null)
      .map((_, idx) => encodeScript(`OP_${idx + 1} OP_EQUAL`).buffer);

    const privateKey = BigInt(
      '0xce1fc7baa9db31c4ef9c6564f70d551f41fc479bb23fa844d50848220edaaf91',
    );

    const { address, tweakedPrivateKey, tweakedPublicKey } = encodeP2TR(
      BitcoinNetworks.REGTEST,
      privateKey,
      scripts,
    );

    expect(address).toBe(
      'bcrt1p2cjjjprlga4e4qe6tfuq5avytmpjnqpnp4mdrtylx5wuw67wt4eqj5weh4',
    );
    expect(getPublicKey(tweakedPrivateKey).y % 2n === 0n).toBeTruthy();
    expect(
      bigIntToBigEndianBytes(getPublicKey(tweakedPrivateKey).x).toString('hex'),
    ).toBe(tweakedPublicKey.toString('hex'));
    expect(decodeP2TR(address).hash.toString('hex')).toBe(
      bigIntToBigEndianBytes(getPublicKey(tweakedPrivateKey).x).toString('hex'),
    );
  });
});
