import { ScriptEvaluator } from '../../classes/ScriptEvaluator';
import { createP2SHAddress } from './createP2SHAddress';
import { BitcoinNetworks } from '../../types/BitcoinNetworks';

describe('Basic createP2SHAddress tests', () => {
  it('should return correct address', () => {
    const input =
      '3045022100c233c3a8a510e03ad18b0a24694ef00c78101bfd5ac075b8c1037952ce26e91e02205aa5f8f88f29bb4ad5808ebc12abfd26bd791256f367b04c6d955f01f28a772401 03f0609c81a45f8cab67fc2d050c21b1acd3d37c7acfd54041be6601ab4cef4f31';
    const output = '2N6jXuQvhCGrK4VG1yvrHb1ZTqpwkyU8bYa';

    const se = new ScriptEvaluator();
    se.fromASM(input);

    expect(
      createP2SHAddress(
        BitcoinNetworks.TESTNET,
        Buffer.from(se.serialize(), 'hex'),
      ),
    ).toBe(output);
  });
});
