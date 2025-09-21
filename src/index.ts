import { infoAddress } from './utils/infoAddress';
import { btcToSatoshi } from './utils/btcToSatoshi';
import { Transaction } from './classes/Transaction';
import { infoScript } from './utils/infoScript';
import { TransactionSigner } from './classes/Transaction/TransactionSigner';
import { infoTaproot } from './utils/infoTaproot';
import { getP2TRScriptPubKey } from './formats/address/p2tr';
import { encodeScript } from './formats/script';
import {
  getTaprootPath,
  TAPROOT_LEAF_VERSION,
} from './utils/createTaprootTree';
import { SignatureHashType } from './types/SignatureHashType';
import { Buffer } from 'node:buffer';

const from = infoAddress(1n);
const to = infoAddress(2n);

const shNew = infoScript(
  `OP_2 ${from.SECKey.toString('hex')} ${to.SECKey.toString('hex')} OP_2 OP_CHECKMULTISIG`,
);

const scripts = [
  `${from.SECKey.subarray(1).toString('hex')} OP_CHECKSIG`,
  `${to.SECKey.subarray(1).toString('hex')} OP_CHECKSIG`,
];

const tr = infoTaproot(from.secret, scripts);

const sh = infoScript(shNew.P2WSHPubKey.asm);

const inputAmount = btcToSatoshi(12.5);
const amountToSpend = inputAmount - 1000n;

const tx = new Transaction()
  .addInput({
    previousTransactionID:
      'a8efb3cbc386baa701bdc106c299685ed2a21fd9d2ae021a2e2d193195e12692',
    previousTransactionOutputIndex: 0,
  })
  .addOutput({
    amount: amountToSpend,
    scriptPublicKey: from.P2WPKHPubKey.buffer,
  })
  .setVersion(2);

const script = encodeScript(scripts[0]!);

const signer = new TransactionSigner(tx);

const pathToScript = getTaprootPath(tr.merkleTree, script.buffer)!;

console.log(script.asm.startsWith(from.SECKey.subarray(1).toString('hex')));

const signature = signer.getWitnessV1Signature(
  0,
  from.secret,
  [getP2TRScriptPubKey(tr.P2TR).buffer],
  [inputAmount],
  SignatureHashType.SIGHASH_ALL,
  tr.merkleTree.left?.hash,
);

const controlBlock = Buffer.concat([
  TAPROOT_LEAF_VERSION,
  from.SECKey.subarray(1),
  ...pathToScript,
]);

console.log('Signature: ', signature.length);

// Don't use script even with constant OP_CODES (OP_3 etc.)
// supports only values in hex
tx.setInputWitness(0, [signature, script.buffer, controlBlock]);

console.log(tx.serialize().toString('hex'));
