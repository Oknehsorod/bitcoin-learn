import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { decodeP2WSH, encodeP2WSH } from './p2wsh';
import { encodeScript } from '../script';
import { createHash } from 'node:crypto';

describe('Base p2wsh tests', () => {
  it('should decode/encode in the same way', () => {
    for (let i = 0; i < 100; i += 1) {
      const secret = BigInt(Math.floor(Math.random() * 100000));
      const script = encodeScript(`${secret}`).buffer;
      const address = encodeP2WSH(BitcoinNetworks.REGTEST, script);
      const result = decodeP2WSH(address);
      expect(result.hash.toString('hex')).toBe(
        createHash('sha256').update(script).digest().toString('hex'),
      );
      expect(result.network).toBe(BitcoinNetworks.REGTEST);
    }
  });
});
