import { infoAddress } from './utils/infoAddress';
import { btcToSatoshi } from './utils/btcToSatoshi';
import { Transaction } from './classes/Transaction';
import { infoScript } from './utils/infoScript';
import { TransactionSigner } from './classes/Transaction/TransactionSigner';
import { infoTaproot } from './utils/infoTaproot';
import { getP2TRScriptPubKey } from './formats/address/p2tr';

const from = infoAddress(1n);
const to = infoAddress(2n);

const shNew = infoScript(
  `OP_2 ${from.SECKey.toString('hex')} ${to.SECKey.toString('hex')} OP_2 OP_CHECKMULTISIG`,
);

const scripts = new Array(5)
  .fill(null)
  .map((_, idx) => `OP_${idx + 1} OP_EQUAL`);
const tr = infoTaproot(from.secret, scripts);

const sh = infoScript(shNew.P2WSHPubKey.asm);

const inputAmount = btcToSatoshi(25.00001);
const amountToSpend = inputAmount - 1000n;

const tx = new Transaction()
  .addInput({
    previousTransactionID:
      '9835ce8f72264b543bf9774fdf7a049c259423232671d8cffe48079f94b32ce0',
    previousTransactionOutputIndex: 0,
  })
  .addOutput({
    amount: amountToSpend,
    scriptPublicKey: from.P2WPKHPubKey.buffer,
  })
  .setVersion(2);

const signer = new TransactionSigner(tx);

const signature = signer.getWitnessV1Signature(
  0,
  tr.tweakedPrivateKey,
  [getP2TRScriptPubKey(tr.P2TR).buffer],
  [inputAmount],
);

tx.setInputWitness(0, [signature]);

console.log(tx.serialize().toString('hex'));
