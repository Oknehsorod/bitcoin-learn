import { infoAddress } from './utils/infoAddress';
import { btcToSatoshi } from './utils/btcToSatoshi';
import { SignatureHashType } from './types/SignatureHashType';
import { Transaction } from './classes/Transaction';
import { infoScript } from './utils/infoScript';
import { getP2SHScriptSig } from './formats/address/p2sh';
import { getP2WSHWitness } from './formats/address/p2wsh';

const from = infoAddress(1n);
const to = infoAddress(2n);

const shNew = infoScript(
  `OP_2 ${from.SECKey.toString('hex')} ${to.SECKey.toString('hex')} OP_2 OP_CHECKMULTISIG`,
);

const sh = infoScript(shNew.P2WSHPubKey.asm);

const inputAmount = btcToSatoshi(49.99999);
const amountToSpend = inputAmount - 1000n;

const tx = new Transaction()
  .addInput({
    previousTransactionID:
      '8403290a3b071d63acddde7e051dfef2360e2e3fcdfd308a4eb375ad0fb8c9bf',
    previousTransactionOutputIndex: 0,
  })
  .addOutput({
    amount: amountToSpend,
    scriptPublicKey: to.P2WPKHPubKey.buffer,
  })
  .setVersion(2);

tx.setIsWitness(true);

const witness: Buffer[] = [Buffer.alloc(0)];

[from, to].forEach((inf) => {
  const signature = Transaction.getSignature(
    inf.secret,
    tx.getSighHashWitnessV0(
      0,
      shNew.script.buffer,
      inputAmount,
      SignatureHashType.SIGHASH_ALL,
    ),
    SignatureHashType.SIGHASH_ALL,
  );
  witness.push(signature);
});

tx.setInputScriptSignature(0, getP2SHScriptSig(sh.script.buffer));

tx.setInputWitness(0, getP2WSHWitness(witness, shNew.script.buffer));

console.log(tx.serialize().toString('hex'));
