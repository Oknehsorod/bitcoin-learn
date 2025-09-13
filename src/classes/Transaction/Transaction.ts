import { encodeVarints, readVarints } from '../../utils/varintsUtils';
import _ from 'lodash';
import { BufferReader } from '../BufferReader';
import { createHash } from 'node:crypto';
import { SignatureHashType } from '../../types/SignatureHashType';
import {
  CredentialKey,
  Optional,
  TransactionExport,
  TransactionInput,
  TransactionOutput,
} from './types';
import { getDERSignature } from '../../utils/getDERSignature';
import { createSignature } from '../../utils/createSignature';
import { ScriptEvaluator } from '../ScriptEvaluator';
import { getSECPublicKey } from '../../utils/getSECPublicKey';
import { getPublicKey } from '../../utils/getPublicKey';

const DEFAULT_SEQUENCE = 0xffffffff;

export class Transaction {
  private version: number;
  private lockTime: number;

  private readonly inputs: TransactionInput[];
  private readonly outputs: TransactionOutput[];

  constructor(
    inputs: TransactionInput[] = [],
    outputs: TransactionOutput[] = [],
    lockTime = 0,
    version = 1,
  ) {
    this.version = version;
    this.lockTime = lockTime;

    this.inputs = inputs;
    this.outputs = outputs;
  }

  static parse(transactionToParse: Buffer) {
    let buf = new BufferReader(transactionToParse);

    const version = buf.consumeUInt32LE();

    const inputLength = readVarints(buf);
    const inputs: TransactionInput[] = [];
    for (let i = 0; i < inputLength; i += 1) {
      inputs.push({
        previousTransactionID: buf.consume(32).reverse().toString('hex'),
        previousTransactionOutputIndex: buf.consumeUInt32LE(),
        scriptSignature: buf.consume(Number(readVarints(buf))),
        sequence: buf.consumeUInt32LE(),
      });
    }

    const outputLength = readVarints(buf);
    const outputs: TransactionOutput[] = [];
    for (let i = 0; i < outputLength; i += 1) {
      outputs.push({
        amount: buf.consumeBigUInt64LE(),
        scriptPublicKey: buf.consume(Number(readVarints(buf))),
      });
    }

    const lockTime = buf.consumeUInt32LE();

    return new Transaction(inputs, outputs, lockTime, version);
  }
  static getSignature(
    secretKey: bigint,
    hashToSign: Buffer,
    hashType: SignatureHashType,
  ): Buffer {
    const derSig = Buffer.from(
      getDERSignature(createSignature(secretKey, hashToSign)),
      'hex',
    );
    const flag = Buffer.alloc(1);
    flag.writeUInt8(hashType);

    return Buffer.concat([derSig, flag]);
  }

  public serialize(): Buffer {
    const version = Buffer.alloc(4);
    version.writeUInt32LE(this.version);

    const inputCount = encodeVarints(this.inputs.length);

    const inputs = this.inputs.map((input) => {
      const prevTxID = Buffer.from(
        input.previousTransactionID,
        'hex',
      ).reverse();
      const prevIndex = Buffer.alloc(4);
      prevIndex.writeUInt32LE(input.previousTransactionOutputIndex);

      const scriptSigLength = encodeVarints(input.scriptSignature.length);

      const sequence = Buffer.alloc(4);
      sequence.writeUInt32LE(input.sequence ?? 0xffffffff);

      return [
        prevTxID,
        prevIndex,
        scriptSigLength,
        input.scriptSignature,
        sequence,
      ];
    });

    const outputCount = encodeVarints(this.outputs.length);

    const outputs = this.outputs.map((output) => {
      const amount = Buffer.alloc(8);
      amount.writeBigUInt64LE(output.amount);

      const scriptPubKeyLength = encodeVarints(output.scriptPublicKey.length);

      return [amount, scriptPubKeyLength, output.scriptPublicKey];
    });

    const lockTime = Buffer.alloc(4);
    lockTime.writeUInt32LE(this.lockTime);

    return Buffer.concat([
      version,
      inputCount,
      ...inputs.flat(),
      outputCount,
      ...outputs.flat(),
      lockTime,
    ]);
  }
  public export(): TransactionExport {
    return {
      version: this.version,
      lockTime: this.lockTime,
      inputs: _.cloneDeep(this.inputs),
      outputs: _.cloneDeep(this.outputs),
    };
  }

  public addInput(
    input: Optional<TransactionInput, 'sequence' | 'scriptSignature'>,
  ): this {
    this.inputs.push({
      ...input,
      sequence: input.sequence ?? DEFAULT_SEQUENCE,
      scriptSignature: input.scriptSignature ?? Buffer.alloc(0),
    });
    return this;
  }
  public addOutput(output: TransactionOutput): this {
    this.outputs.push(output);
    return this;
  }

  public setTimeLock(timeLock: number): this {
    this.lockTime = timeLock;
    return this;
  }
  public setVersion(version: number): this {
    this.version = version;
    return this;
  }

  public getInputsLength(): number {
    return this.inputs.length;
  }
  public setInputScriptSignature(inputIndex: number, value: Buffer): this {
    if (_.isNil(this.inputs[inputIndex]))
      throw new Error('There is not such input');
    this.inputs[inputIndex].scriptSignature = value;
    return this;
  }

  public getSignHash(
    inputIndex: number,
    previousOutputScriptPublicKey: Buffer,
    hashType: SignatureHashType,
  ) {
    const transactionExportData = this.export();
    const transactionToHash = new Transaction(
      transactionExportData.inputs,
      transactionExportData.outputs,
      transactionExportData.lockTime,
      transactionExportData.version,
    );

    const inputsLength = transactionToHash.getInputsLength();

    if (inputIndex >= inputsLength) throw new Error('There is not such input');

    for (let i = 0; i < inputsLength; i += 1)
      transactionToHash.setInputScriptSignature(i, Buffer.alloc(0));

    transactionToHash.setInputScriptSignature(
      inputIndex,
      previousOutputScriptPublicKey,
    );

    const flag = Buffer.alloc(4);
    flag.writeUInt32LE(hashType);

    const hexedTx = Buffer.concat([transactionToHash.serialize(), flag]);

    return createHash('sha256')
      .update(createHash('sha256').update(hexedTx).digest())
      .digest();
  }

  public signP2PKInput(
    inputIndex: number,
    previousOutputScriptPublicKey: Buffer,
    { secretKey }: CredentialKey,
    hashType: SignatureHashType,
  ): this {
    if (_.isNil(this.inputs[inputIndex]))
      throw new Error('There is not such input');

    const hashToSign = this.getSignHash(
      inputIndex,
      previousOutputScriptPublicKey,
      hashType,
    );

    const derSig = Buffer.from(
      getDERSignature(createSignature(secretKey, hashToSign)),
      'hex',
    );
    const flag = Buffer.alloc(1);
    flag.writeUInt8(hashType);

    const scriptEvaluator = new ScriptEvaluator();
    scriptEvaluator.fromASM(Buffer.concat([derSig, flag]).toString('hex'));

    this.setInputScriptSignature(
      inputIndex,
      Buffer.from(scriptEvaluator.serialize(), 'hex'),
    );

    return this;
  }

  public signP2PK(
    previousOutputScriptPublicKey: Buffer,
    credentialKey: CredentialKey,
    hashType: SignatureHashType,
  ): this {
    this.inputs.forEach((_, idx) =>
      this.signP2PKInput(
        idx,
        previousOutputScriptPublicKey,
        credentialKey,
        hashType,
      ),
    );

    return this;
  }

  public signP2PKHInput(
    inputIndex: number,
    previousOutputScriptPublicKey: Buffer,
    { secretKey, isPublicKeyCompressed }: CredentialKey,
    hashType: SignatureHashType,
  ): this {
    if (_.isNil(this.inputs[inputIndex]))
      throw new Error('There is not such input');

    const hashToSign = this.getSignHash(
      inputIndex,
      previousOutputScriptPublicKey,
      hashType,
    );

    const derSig = Buffer.from(
      getDERSignature(createSignature(secretKey, hashToSign)),
      'hex',
    );
    const flag = Buffer.alloc(1);
    flag.writeUInt8(hashType);

    const scriptEvaluator = new ScriptEvaluator();
    scriptEvaluator.fromASM(
      `${Buffer.concat([derSig, flag]).toString('hex')} ${getSECPublicKey(getPublicKey(secretKey), isPublicKeyCompressed)}`,
    );

    this.setInputScriptSignature(
      inputIndex,
      Buffer.from(scriptEvaluator.serialize(), 'hex'),
    );

    return this;
  }

  public signP2PKH(
    previousOutputScriptPublicKey: Buffer,
    credentialKey: CredentialKey,
    hashType: SignatureHashType,
  ): this {
    this.inputs.forEach((_, idx) =>
      this.signP2PKHInput(
        idx,
        previousOutputScriptPublicKey,
        credentialKey,
        hashType,
      ),
    );

    return this;
  }
}
