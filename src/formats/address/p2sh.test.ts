import { decodeP2SH, encodeP2SH } from './p2sh';
import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import { hash160 } from '../../utils/hash160';
import { encodeScript } from '../script';

describe('Basic createP2SHAddress tests', () => {
  it('should return correct address', () => {
    const input =
      '3045022100c233c3a8a510e03ad18b0a24694ef00c78101bfd5ac075b8c1037952ce26e91e02205aa5f8f88f29bb4ad5808ebc12abfd26bd791256f367b04c6d955f01f28a772401 03f0609c81a45f8cab67fc2d050c21b1acd3d37c7acfd54041be6601ab4cef4f31';
    const output = '2N6jXuQvhCGrK4VG1yvrHb1ZTqpwkyU8bYa';

    const network = BitcoinNetworks.TESTNET;

    const script = encodeScript(input);
    const address = encodeP2SH(network, script.buffer);

    expect(address).toBe(output);
    expect(decodeP2SH(address).scriptHash.toString('hex')).toBe(
      hash160(script.buffer).toString('hex'),
    );
  });
});
