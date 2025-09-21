import { decodeVarInt, encodeVarInt } from '../../utils/varintsUtils';
import _ from 'lodash';
import { BufferReader } from '../BufferReader';
import { SignatureHashType } from '../../types/SignatureHashType';
import {
  Optional,
  TransactionExport,
  TransactionInput,
  TransactionOutput,
} from './types';
import { createSignature } from '../../utils/createSignature';
import { getPublicKey } from '../../utils/getPublicKey';
import { Buffer } from 'node:buffer';
import { decodeDER, encodeDER } from '../../formats/der';
import { decodeScript } from '../../formats/script';
import { hash256 } from '../../utils/hash256';
import { verifySignature } from '../../utils/verifySignature';
import { hashTagged } from '../../utils/hashTagged';
import {
  createSchnorrSignature,
  verifySchnorrSignature,
} from '../../utils/schnorrSignature';
import { bigIntToBigEndianBytes } from '../../utils/bytesUtils';
import { BufferWriter } from '../BufferWriter';

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
    if (transactionToParse[5] === 0x00 && transactionToParse[6] === 0x01)
      return this.parseSigWit(transactionToParse);
    return this.parseLegacy(transactionToParse);
  }

  static parseSigWit(transactionToParse: Buffer) {
    let buf = new BufferReader(transactionToParse);

    const version = buf.consumeUInt32LE();
    const marker = buf.consume(2);

    if (marker.toString('hex') !== '0001') throw new Error('Not a seg wit tx');

    const inputLength = decodeVarInt(buf);
    const inputs: TransactionInput[] = [];
    for (let i = 0; i < inputLength; i += 1) {
      inputs.push({
        previousTransactionID: buf.consume(32).reverse().toString('hex'),
        previousTransactionOutputIndex: buf.consumeUInt32LE(),
        scriptSignature: buf.consume(Number(decodeVarInt(buf))),
        sequence: buf.consumeUInt32LE(),
        witness: [],
      });
    }

    const outputLength = decodeVarInt(buf);
    const outputs: TransactionOutput[] = [];
    for (let i = 0; i < outputLength; i += 1) {
      outputs.push({
        amount: buf.consumeBigUInt64LE(),
        scriptPublicKey: buf.consume(Number(decodeVarInt(buf))),
      });
    }

    for (let i = 0; i < inputLength; i += 1) {
      const numItems = decodeVarInt(buf);
      const items: Buffer[] = [];
      for (let j = 0; j < numItems; j += 1) {
        const itemLength = decodeVarInt(buf);
        if (itemLength === 0) {
          items.push(Buffer.alloc(0));
        } else {
          items.push(buf.consume(Number(itemLength)));
        }
      }
      inputs[i]!.witness = items;
    }

    const lockTime = buf.consumeUInt32LE();
    return new Transaction(inputs, outputs, lockTime, version);
  }

  static parseLegacy(transactionToParse: Buffer) {
    let buf = new BufferReader(transactionToParse);

    const version = buf.consumeUInt32LE();

    const inputLength = decodeVarInt(buf);
    const inputs: TransactionInput[] = [];
    for (let i = 0; i < inputLength; i += 1) {
      inputs.push({
        previousTransactionID: buf.consume(32).reverse().toString('hex'),
        previousTransactionOutputIndex: buf.consumeUInt32LE(),
        scriptSignature: buf.consume(Number(decodeVarInt(buf))),
        sequence: buf.consumeUInt32LE(),
        witness: [],
      });
    }

    const outputLength = decodeVarInt(buf);
    const outputs: TransactionOutput[] = [];
    for (let i = 0; i < outputLength; i += 1) {
      outputs.push({
        amount: buf.consumeBigUInt64LE(),
        scriptPublicKey: buf.consume(Number(decodeVarInt(buf))),
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
    const signature = createSignature(secretKey, hashToSign);
    const derSig = encodeDER(signature);
    const flag = Buffer.alloc(1);
    flag.writeUInt8(hashType);

    if (
      !verifySignature(getPublicKey(secretKey), {
        ...decodeDER(derSig)!,
        z: BigInt('0x' + hashToSign.toString('hex')),
      })
    )
      throw new Error('Wrong signature');

    return Buffer.concat([derSig, flag]);
  }

  static getSchnorrSignature(
    secretKey: bigint,
    hashToSign: Buffer,
    hashType: SignatureHashType,
  ): Buffer {
    const signature = createSchnorrSignature(secretKey, hashToSign);
    const flag = Buffer.alloc(1);
    flag.writeUInt8(hashType);

    if (
      !verifySchnorrSignature(
        bigIntToBigEndianBytes(getPublicKey(secretKey).x),
        hashToSign,
        signature,
      )
    )
      throw new Error('Invalid schnorr signature');

    return Buffer.concat([signature, flag]);
  }

  public serialize(): Buffer {
    if (!this.isSegregatedWitness) return this.serializeLegacy();
    return this.serializeSegWit();
  }

  public serializeSegWit(): Buffer {
    const version = Buffer.alloc(4);
    version.writeUInt32LE(this.version);

    const inputCount = encodeVarInt(this.inputs.length);

    const inputs = this.inputs.map((input) => {
      const prevTxID = Buffer.from(
        input.previousTransactionID,
        'hex',
      ).reverse();
      const prevIndex = Buffer.alloc(4);
      prevIndex.writeUInt32LE(input.previousTransactionOutputIndex);

      const scriptSigLength = encodeVarInt(input.scriptSignature.length);

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

    const outputCount = encodeVarInt(this.outputs.length);

    const outputs = this.outputs.map((output) => {
      const amount = Buffer.alloc(8);
      amount.writeBigUInt64LE(output.amount);

      const scriptPubKeyLength = encodeVarInt(output.scriptPublicKey.length);

      return [amount, scriptPubKeyLength, output.scriptPublicKey];
    });

    const witnessBuffers: Buffer[] = [];

    this.inputs.forEach(({ witness }) => {
      const stackItems = witness.map((w) =>
        Buffer.concat([encodeVarInt(w.length), w]),
      );
      const inputWitness = Buffer.concat([
        encodeVarInt(witness.length),
        ...stackItems,
      ]);
      witnessBuffers.push(inputWitness);
    });

    const witnessData = Buffer.concat(witnessBuffers);

    const lockTime = Buffer.alloc(4);
    lockTime.writeUInt32LE(this.lockTime);

    return Buffer.concat([
      version,
      Buffer.from([0x00, 0x01]),
      inputCount,
      ...inputs.flat(),
      outputCount,
      ...outputs.flat(),
      witnessData,
      lockTime,
    ]);
  }

  public serializeLegacy(): Buffer {
    const version = Buffer.alloc(4);
    version.writeUInt32LE(this.version);

    const inputCount = encodeVarInt(this.inputs.length);

    const inputs = this.inputs.map((input) => {
      const prevTxID = Buffer.from(
        input.previousTransactionID,
        'hex',
      ).reverse();
      const prevIndex = Buffer.alloc(4);
      prevIndex.writeUInt32LE(input.previousTransactionOutputIndex);

      const scriptSigLength = encodeVarInt(input.scriptSignature.length);

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

    const outputCount = encodeVarInt(this.outputs.length);

    const outputs = this.outputs.map((output) => {
      const amount = Buffer.alloc(8);
      amount.writeBigUInt64LE(output.amount);

      const scriptPubKeyLength = encodeVarInt(output.scriptPublicKey.length);

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
    input: Optional<
      TransactionInput,
      'witness' | 'sequence' | 'scriptSignature'
    >,
  ): this {
    this.inputs.push({
      ...input,
      witness: input.witness ?? [],
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

  public setInputWitness(inputIndex: number, value: Buffer[]): this {
    if (_.isNil(this.inputs[inputIndex]))
      throw new Error('There is not such input');
    this.inputs[inputIndex].witness = value;
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

    const hexedTx = Buffer.concat([transactionToHash.serializeLegacy(), flag]);

    return hash256(hexedTx);
  }

  public getSighHashWitnessV0(
    inputIndex: number,
    prevOutputScript: Buffer,
    amount: bigint,
    hashType: SignatureHashType = SignatureHashType.SIGHASH_ALL,
  ): Buffer {
    const version = Buffer.alloc(4);
    version.writeUInt32LE(this.version);

    const locktime = Buffer.alloc(4);
    locktime.writeUInt32LE(this.lockTime);

    let prevOuts: Buffer[] = [];
    let sequence: Buffer[] = [];

    let outs: Buffer = Buffer.alloc(0);

    this.inputs.forEach((input) => {
      const prevTxIdLE = Buffer.from(
        input.previousTransactionID,
        'hex',
      ).reverse();
      const prevTxIdxLE = Buffer.alloc(4);
      const seq = Buffer.alloc(4);
      seq.writeUInt32LE(input.sequence);

      sequence.push(seq);

      prevTxIdxLE.writeUInt32LE(input.previousTransactionOutputIndex);

      prevOuts.push(Buffer.concat([prevTxIdLE, prevTxIdxLE]));
    });

    this.outputs.forEach((output) => {
      const amount = Buffer.alloc(8);
      amount.writeBigUInt64LE(output.amount);

      const pubKey = Buffer.concat([
        encodeVarInt(output.scriptPublicKey.length),
        output.scriptPublicKey,
      ]);

      outs = Buffer.concat([outs, amount, pubKey]);
    });

    const hashPrevOuts = hash256(Buffer.concat(prevOuts));
    const hashSequence = hash256(Buffer.concat(sequence));
    const hashOutputs = hash256(outs);

    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(amount);

    const hashTypeBuffer = Buffer.alloc(4);
    hashTypeBuffer.writeUInt32LE(hashType);

    return hash256(
      Buffer.concat([
        version,
        hashPrevOuts,
        hashSequence,
        prevOuts[inputIndex]!,
        Buffer.concat([
          encodeVarInt(prevOutputScript.length),
          prevOutputScript,
        ]),
        amountBuffer,
        sequence[inputIndex]!,
        hashOutputs,
        locktime,
        hashTypeBuffer,
      ]),
    );
  }

  public getSighHashWitnessV1(
    inputIndex: number,
    prevOutputScripts: Buffer[],
    amounts: bigint[],
    hashType: SignatureHashType = SignatureHashType.SIGHASH_ALL,
    leafHash?: Buffer,
  ): Buffer {
    const bufWriter = new BufferWriter()
      .writeUInt8(hashType)
      .writeUInt32LE(this.version)
      .writeUInt32LE(this.lockTime);

    if (hashType !== SignatureHashType.SIGHASH_ANYONECANPAY) {
      bufWriter.appendSHA256(
        Buffer.concat(
          this.inputs.map((input) => {
            const prevTxIdLE = Buffer.from(
              input.previousTransactionID,
              'hex',
            ).reverse();
            const prevTxIdxLE = Buffer.alloc(4);
            prevTxIdxLE.writeUInt32LE(input.previousTransactionOutputIndex);

            return Buffer.concat([prevTxIdLE, prevTxIdxLE]);
          }),
        ),
      );

      bufWriter.appendSHA256(
        Buffer.concat(
          amounts.map((amount) => {
            const amountLE = Buffer.alloc(8);
            amountLE.writeBigUInt64LE(amount);
            return amountLE;
          }),
        ),
      );

      bufWriter.appendSHA256(
        Buffer.concat(
          prevOutputScripts.map((script) =>
            Buffer.concat([encodeVarInt(script.length), script]),
          ),
        ),
      );

      bufWriter.appendSHA256(
        Buffer.concat(
          this.inputs.map((input) => {
            const sequenceLE = Buffer.alloc(4);
            sequenceLE.writeUInt32LE(input.sequence);
            return sequenceLE;
          }),
        ),
      );
    }

    if (
      hashType !== SignatureHashType.SIGHASH_NONE &&
      hashType !== SignatureHashType.SIGHASH_SINGLE
    ) {
      bufWriter.appendSHA256(
        Buffer.concat(
          this.outputs.map((output) => {
            const amountLE = Buffer.alloc(8);
            amountLE.writeBigUInt64LE(output.amount);

            return Buffer.concat([
              amountLE,
              encodeVarInt(output.scriptPublicKey.length),
              output.scriptPublicKey,
            ]);
          }),
        ),
      );
    }

    bufWriter.writeUInt8(leafHash ? 0x02 : 0x00);

    if (hashType === SignatureHashType.SIGHASH_ANYONECANPAY) {
      bufWriter.append(
        Buffer.from(
          this.inputs[inputIndex]!.previousTransactionID,
          'hex',
        ).reverse(),
      );
      bufWriter.writeUInt32LE(
        this.inputs[inputIndex]!.previousTransactionOutputIndex,
      );
      bufWriter.append(
        Buffer.concat([
          encodeVarInt(this.inputs[inputIndex]!.scriptSignature.length),
          this.inputs[inputIndex]!.scriptSignature,
        ]),
      );
      bufWriter.writeUInt32LE(this.inputs[inputIndex]!.sequence);
    }

    if (hashType !== SignatureHashType.SIGHASH_ANYONECANPAY) {
      bufWriter.writeUInt32LE(inputIndex);
    }

    if (hashType === SignatureHashType.SIGHASH_SINGLE) {
      const correspondingOutput = this.outputs[inputIndex]!;

      const amountLE = Buffer.alloc(8);
      amountLE.writeBigUInt64LE(correspondingOutput.amount);

      bufWriter.appendSHA256(
        Buffer.concat([
          amountLE,
          encodeVarInt(correspondingOutput.scriptPublicKey.length),
          correspondingOutput.scriptPublicKey,
        ]),
      );
    }

    if (leafHash) {
      bufWriter.append(leafHash);
      bufWriter.writeUInt8(0x00);
      bufWriter.writeUInt32LE(0xffffffff);
    }

    return hashTagged(
      'TapSighash',
      Buffer.concat([Buffer.from([0x00]), bufWriter.getBuffer()]),
    );
  }

  get isSegregatedWitness() {
    return this.inputs.some((el) => el.witness.length > 0);
  }

  get isCoinbase() {
    return (
      this.inputs.length === 1 &&
      this.inputs[0]?.previousTransactionID ===
        Buffer.alloc(32, 0x00).toString('hex') &&
      this.inputs[0]?.previousTransactionOutputIndex === 0xffffffff
    );
  }

  get coinbaseHeight() {
    if (!this.isCoinbase) throw new Error('Not a coinbase tx!');
    if (!this.inputs[0]) throw new Error('There is no such an input!');

    const { parsed } = decodeScript(this.inputs[0].scriptSignature);
    const blockHeight = parsed[0];
    if (!Buffer.isBuffer(blockHeight)) throw new Error("It's not a buffer");

    return blockHeight.readUIntLE(0, 4);
  }
}
