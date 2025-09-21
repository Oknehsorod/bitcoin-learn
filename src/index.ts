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

const inputAmount = btcToSatoshi(25);
const amountToSpend = inputAmount - 1000n;

const tx = new Transaction()
  .addInput({
    previousTransactionID:
      '7fa9177b7363b6513419e0e29bb15d17a1eb04e164dc52960e3b4da275e0bb55',
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

const scriptInput = encodeScript('OP_3');
const script = encodeScript(scripts[2]!);
const pathToScript = getTaprootPath(tr.merkleTree, script.buffer)!;
console.log(scriptInput.buffer);

const controlBlock = Buffer.concat([
  TAPROOT_LEAF_VERSION,
  from.SECKey.subarray(1),
  ...pathToScript,
]);

console.log(from.SECKey.length);

// Don't use script even with constant OP_CODES (OP_3 etc.)
// supports only values in hex
tx.setInputWitness(0, [Buffer.from([0x03]), script.buffer, controlBlock]);

console.log(tx.serialize().toString('hex'));
