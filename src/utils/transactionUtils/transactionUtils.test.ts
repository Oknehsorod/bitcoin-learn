import { parseTransaction } from './parseTransaction';
import { Transaction } from '../../types/Transaction';
import { btcToSatoshi } from '../btcToSatoshi';
import { serializeTransaction } from './serializeTransaction';

describe('Basic transaction utils tests', () => {
  it('should parse and serialize correctly', () => {
    const input =
      '0100000001ec1f1c0183ea0e80e098131ba234fec72d3820c94e95ec2f3fc9f2b24108276e000000006b483045022100ea46e1f7bd3b07127ca2e64d8c1bca3826b1380a147a4d82cefa4cc771dae65902206874e12f254c02b8da570d2825ef84c2b3ba7ff66a202e135e22fc7413f57bbb01210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ffffffff0118f5029500000000045193578700000000';

    const correctTransaction: Transaction = {
      version: 1,
      locktime: 0,
      input: [
        {
          prevTxID:
            '6e270841b2f2c93f2fec954ec920382dc7fe34a21b1398e0800eea83011c1fec',
          prevIndex: 0,
          scriptSig:
            '483045022100ea46e1f7bd3b07127ca2e64d8c1bca3826b1380a147a4d82cefa4cc771dae65902206874e12f254c02b8da570d2825ef84c2b3ba7ff66a202e135e22fc7413f57bbb01210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          sequence: 4294967295,
        },
      ],
      output: [
        {
          amount: btcToSatoshi(24.99999),
          pubKey: '51935787',
        },
      ],
    };

    const tx = parseTransaction(input);

    expect(tx).toEqual(correctTransaction);

    expect(serializeTransaction(tx).toString('hex')).toBe(input);
  });
});
