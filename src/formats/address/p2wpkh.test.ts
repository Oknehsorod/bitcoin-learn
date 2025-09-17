import { decodeP2WPKH, encodeP2WPKH } from './p2wpkh';
import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { encodeSEC } from '../sec';
import { getPublicKey } from '../../utils/getPublicKey';
import { hash160 } from '../../utils/hash160';

describe('Base p2wpkh tests', () => {
  it('should decode/encode in the same way', () => {
    for (let i = 0; i < 100; i += 1) {
      const secret = BigInt(Math.floor(Math.random() * 100000));
      const secKey = encodeSEC(getPublicKey(secret), true);
      const address = encodeP2WPKH(BitcoinNetworks.REGTEST, secKey);
      const result = decodeP2WPKH(address);
      expect(result.hash.toString('hex')).toBe(hash160(secKey).toString('hex'));
      expect(result.network).toBe(BitcoinNetworks.REGTEST);
    }
  });
});
