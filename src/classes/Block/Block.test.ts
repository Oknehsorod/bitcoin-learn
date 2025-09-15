import { Block } from './Block';
import { last } from 'lodash';

describe('Basic Block tests', () => {
  it('should compute target correctly', () => {
    const block = Block.parse(
      Buffer.from(
        '00000020804594a1858660284f6ac9d3ed50b4adccaab04903f3ba32635ef4a01b96c33077e0832cb796c62ea2cd828e8fa9f71175e3f7b64151a3a7993df7b68fa8400eea56c568ffff7f200000000002020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff0402020400ffffffff02b01ba8040000000017a914b7cd1509f69912a377493c8409e0774a805be56b870000000000000000266a24aa21a9edec1890ff33dc146b03239e0e1e800b3a37527c48bd10f8ccbe47195a738ac5f701200000000000000000000000000000000000000000000000000000000000000000000000000100000001edfd5d1637a09e7b35bca98416593418a42fd08989d99f573f366c9d5220a0730000000006055151935287ffffffff01582a45ba0000000017a914c39c1e979cab943770ea6690fc10537c79326f478700000000',
        'hex',
      ),
    );

    expect(block.target).toBe(
      BigInt(
        '0x7fffff0000000000000000000000000000000000000000000000000000000000',
      ),
    );

    expect(block.difficulty).toBeCloseTo(4.656542373906925e-10);

    expect(block.checkProofOfWork).toBe(true);
  });

  it('should correctly return bits', () => {
    const lastBlock = Block.parse(
      Buffer.from(
        '000000203471101bbda3fe307664b3283a9ef0e97d9a38a7eacd8800000000000000000010c8aba8479bbaa5e0848152fd3c2289ca50e1c3e58c9a4faaafbdf5803c5448ddb845597e8b0118e43a81d3',
        'hex',
      ),
    );
    const firstBlock = Block.parse(
      Buffer.from(
        '02000020f1472d9db4b563c35f97c428ac903f23b7fc055d1cfc26000000000000000000b3f449fcbe1bc4cfbcb8283a0d2c037f961a3fdf2b8bedc144973735eea707e1264258597e8b0118e5f00474',
        'hex',
      ),
    );

    const newTarget = Block.getNewTarget(lastBlock, firstBlock);

    lastBlock.setBitsByTarget(newTarget);

    expect(lastBlock.export().bits.toString('hex')).toBe('80df6217');
  });
});
