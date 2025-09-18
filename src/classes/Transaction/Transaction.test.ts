import { Transaction } from './Transaction';
import { btcToSatoshi } from '../../utils/btcToSatoshi';
import { fromBigEndianBytesToBigInt } from '../../utils/bytesUtils';
import { SignatureHashType } from '../../types/SignatureHashType';
import { TransactionSigner } from './TransactionSigner';

describe('Base transaction tests', () => {
  it('should check coinbase transaction', () => {
    const tx = Transaction.parse(
      Buffer.from(
        '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d0104ffffffff0100f2052a0100000043410496b538e853519c726a2c91e61ec11600ae1390813a627c66fb8be7947be63c52da7589379515d4e0a604f8141781e62294721166bf621e73a82cbf2342c858eeac00000000',
        'hex',
      ),
    );

    expect(tx.isCoinbase).toBe(true);
    expect(tx.coinbaseHeight).toBe(486604799);
  });

  it('should give hash to sign for witness v0', () => {
    const unsignedTransaction = Buffer.from(
      '0100000002fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f0000000000eeffffffef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a0100000000ffffffff02202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac11000000',
      'hex',
    );

    const firstInputPrivateKey = fromBigEndianBytesToBigInt(
      Buffer.from(
        'bbc27228ddcb9209d7fd6f36b02f7dfa6252af40bb2f1cbc7a557da8027ff866',
        'hex',
      ),
    );

    const secondInputPrivateKey = fromBigEndianBytesToBigInt(
      Buffer.from(
        '619c335025c7f4012e556c2a58b2506e30b8511b53ade95ea316fd8c3286feb9',
        'hex',
      ),
    );

    const tx = Transaction.parseLegacy(unsignedTransaction);
    const signer = new TransactionSigner(tx);
    signer
      .signP2WPKHInput(
        1,
        secondInputPrivateKey,
        btcToSatoshi(6),
        SignatureHashType.SIGHASH_ALL,
      )
      .signP2PKInput(0, firstInputPrivateKey, SignatureHashType.SIGHASH_ALL);

    expect(signer.serialize().toString('hex')).toBe(
      '01000000000102fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f00000000494830450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed01eeffffffef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a0100000000ffffffff02202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac000247304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee0121025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee635711000000',
    );
  });
});
