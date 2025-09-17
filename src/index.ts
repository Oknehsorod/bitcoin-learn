import { infoAddress } from './utils/infoAddress';
import { btcToSatoshi } from './utils/btcToSatoshi';
import { SignatureHashType } from './types/SignatureHashType';
import { Transaction } from './classes/Transaction';
import {
  getP2WPKHScriptPubKey,
  getP2WPKHWitness,
} from './formats/address/p2wpkh';

const from = infoAddress(1n);
const to = infoAddress(2n);

const inputAmount = btcToSatoshi(50);
const amountToSpend = btcToSatoshi(1);

const tx = new Transaction()
  .addInput({
    previousTransactionID:
      '489302fc5c4a745271331149937222f40bd6bc98c414806255cab53d3473f70d',
    previousTransactionOutputIndex: 0,
  })
  .addOutput({
    amount: amountToSpend - 1000n,
    scriptPublicKey: to.P2WPKHPubKey.buffer,
  })
  .addOutput({
    amount: inputAmount - amountToSpend,
    scriptPublicKey: from.P2WPKHPubKey.buffer,
  })
  .setVersion(2);

const hashToSign = tx.getSighHashWitnessV0(
  0,
  getP2WPKHScriptPubKey(from.P2WPKH).buffer,
  inputAmount,
  SignatureHashType.SIGHASH_ALL,
);

const signature = Transaction.getSignature(
  from.secret,
  hashToSign,
  SignatureHashType.SIGHASH_ALL,
);

tx.setIsWitness(true);

tx.setInputWitness(0, getP2WPKHWitness(signature, from.SECKey));

console.log(tx.serialize().toString('hex'));
