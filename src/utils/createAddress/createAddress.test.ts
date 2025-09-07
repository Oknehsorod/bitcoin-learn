import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { createAddress } from './createAddress';
import { getSECPublicKey } from '../getSECPublicKey';
import { getPublicKey } from '../getPublicKey';

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
      const result = createAddress(
        network,
        getSECPublicKey(getPublicKey(secretKey), isCompressed),
      );
      expect(result).toBe(outputs[idx]);
    });
  });
});
