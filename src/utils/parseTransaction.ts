import { Transaction } from '../types/Transaction';
import { readVarints } from './varintsUtils';
import { BufferReader } from '../classes/BufferReader';

export const parseTransaction = (transaction: string): Transaction => {
  let buf = new BufferReader(Buffer.from(transaction, 'hex'));

  const version = buf.consumeUInt32LE();
  const inputLength = readVarints(buf);

  const inputs: Transaction['input'] = [];
  for (let i = 0; i < inputLength; i += 1) {
    const prevTx = buf.consume(32).reverse().toString('hex');

    const prevIndex = buf.consumeUInt32LE();

    const scriptLength = readVarints(buf);

    const scriptSig = buf.consume(Number(scriptLength)).toString('hex');

    const sequence = buf.consumeUInt32LE();

    inputs.push({
      prevIndex,
      prevTxID: prevTx,
      scriptSig,
      sequence,
    });
  }

  const outputLength = readVarints(buf);

  const outputs: Transaction['output'] = [];
  for (let i = 0; i < outputLength; i += 1) {
    const amount = buf.consumeBigUInt64LE();

    const scriptPubKeyLength = readVarints(buf);

    const scriptPubKey = buf
      .consume(Number(scriptPubKeyLength))
      .toString('hex');

    outputs.push({
      amount,
      pubKey: scriptPubKey,
    });
  }

  const lockTime = buf.consumeUInt32LE();

  return {
    version,
    input: inputs,
    output: outputs,
    locktime: lockTime,
  };
};
