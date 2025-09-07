import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { createWIF } from './createWIF';

describe('Basic WIF creation tests', () => {
  it('should return valid WIF', () => {
    const secrets: {
      network: BitcoinNetworks;
      isCompressed: boolean;
      secretKey: bigint;
    }[] = [
      {
        network: BitcoinNetworks.TESTNET,
        isCompressed: true,
        secretKey: 5003n,
      },
      {
        network: BitcoinNetworks.TESTNET,
        isCompressed: false,
        secretKey: 2021n ** 5n,
      },
      {
        network: BitcoinNetworks.MAINNET,
        isCompressed: true,
        secretKey: BigInt('0x54321deadbeef'),
      },
    ];

    const outputs = [
      'cMahea7zqjxrtgAbB7LSGbcQUr1uX1ojuat9jZodMN8rFTv2sfUK',
      '91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjpWAxgzczjbCwxic',
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgiuQJv1h8Ytr2S53a',
    ];

    secrets.forEach(({ network, isCompressed, secretKey }, idx) => {
      const result = createWIF(network, secretKey, isCompressed);
      expect(result).toBe(outputs[idx]);
    });
  });
});
