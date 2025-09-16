import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { decodeP2PKH, encodeP2PKH } from './p2pkh';
import { encodeSEC } from '../sec';
import { getPublicKey } from '../../utils/getPublicKey';
import { hash160 } from '../../utils/hash160';

describe('Basic address creation tests', () => {
  it('should return valid addresses', () => {
    const secrets: {
      network: BitcoinNetworks;
      isCompressed: boolean;
      secretKey: bigint;
    }[] = [
      {
        network: BitcoinNetworks.TESTNET,
        isCompressed: false,
        secretKey: 5002n,
      },
      {
        network: BitcoinNetworks.TESTNET,
        isCompressed: true,
        secretKey: 2020n ** 5n,
      },
      {
        network: BitcoinNetworks.MAINNET,
        isCompressed: true,
        secretKey: BigInt('0x12345deadbeef'),
      },
    ];

    const outputs = [
      'mmTPbXQFxboEtNRkwfh6K51jvdtHLxGeMA',
      'mopVkxp8UhXqRYbCYJsbeE1h1fiF64jcoH',
      '1F1Pn2y6pDb68E5nYJJeba4TLg2U7B6KF1',
    ];

    secrets.forEach(({ network, isCompressed, secretKey }, idx) => {
      const secKey = encodeSEC(getPublicKey(secretKey), isCompressed);
      const result = encodeP2PKH(network, secKey);
      expect(result).toBe(outputs[idx]);
      expect(decodeP2PKH(result).network).toBe(network);
      expect(decodeP2PKH(result).hash.toString('hex')).toBe(
        hash160(secKey).toString('hex'),
      );
    });
  });
});
