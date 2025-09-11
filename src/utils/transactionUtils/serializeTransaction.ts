import { Transaction } from '../../types/Transaction';
import { encodeVarints } from '../varintsUtils';

export const serializeTransaction = (tx: Transaction): Buffer => {
  const version = Buffer.alloc(4);
  version.writeUInt32LE(tx.version);

  const inputCount = encodeVarints(tx.input.length);

  const inputs = tx.input.map((input) => {
    const prevTxID = Buffer.from(input.prevTxID, 'hex').reverse();
    const prevIndex = Buffer.alloc(4);
    prevIndex.writeUInt32LE(input.prevIndex);

    const scriptSigLength = encodeVarints(
      Buffer.from(input.scriptSig, 'hex').length,
    );

    const scriptSig = Buffer.from(input.scriptSig, 'hex');
    const sequence = Buffer.alloc(4);
    sequence.writeUInt32LE(input.sequence ?? 0xffffffff);

    return [prevTxID, prevIndex, scriptSigLength, scriptSig, sequence];
  });

  const outputCount = encodeVarints(tx.output.length);

  const outputs = tx.output.map((output) => {
    const amount = Buffer.alloc(8);
    amount.writeBigInt64LE(output.amount);

    const scriptSigLength = encodeVarints(
      Buffer.from(output.pubKey, 'hex').length,
    );

    const scriptSig = Buffer.from(output.pubKey, 'hex');

    return [amount, scriptSigLength, scriptSig];
  });

  const lockTime = Buffer.alloc(4);
  lockTime.writeUInt32LE(tx.locktime);

  return Buffer.concat([
    version,
    inputCount,
    ...inputs.flat(),
    outputCount,
    ...outputs.flat(),
    lockTime,
  ]);
};
