import { BufferReader } from '../BufferReader';
import { hash256 } from '../../utils/hash256';
import {
  bigIntToBigEndianBytes,
  littleEndianToBigInt,
} from '../../utils/bytesUtils';

function trimStart(d: Buffer) {
  let i = 0;
  while (!d[i] && i < d.length) i++;
  return d.subarray(i);
}

export class Block {
  private version: number;
  private prevBlock: string;
  private merkleRoot: string;
  private timestamp: Date;
  private bits: Buffer;
  private nonce: number;

  constructor(
    version: number,
    prevBlock: string,
    merkleRoot: string,
    timestamp: Date,
    bits: Buffer,
    nonce: number,
  ) {
    this.version = version;
    this.prevBlock = prevBlock;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
  }

  static getNewTarget(a: Block, b: Block): bigint {
    const TWO_WEEKS = 60 * 60 * 24 * 14;
    let timeDifferential =
      Math.floor(+a.export().timestamp / 1000) -
      Math.floor(+b.export().timestamp / 1000);
    if (timeDifferential > TWO_WEEKS * 4) {
      timeDifferential = TWO_WEEKS * 4;
    }

    if (timeDifferential < TWO_WEEKS / 4) {
      timeDifferential = TWO_WEEKS / 4;
    }

    return (a.target * BigInt(timeDifferential)) / BigInt(TWO_WEEKS);
  }

  static parse(blockToParse: Buffer): Block {
    const buf = new BufferReader(blockToParse);

    const version = buf.consumeUInt32LE();
    const previousBlock = buf.consume(32);
    const merkleRoot = buf.consume(32);
    const timestamp = buf.consumeUInt32LE();
    const bits = buf.consume(4);
    const nonce = buf.consumeUInt32BE();

    return new Block(
      version,
      previousBlock.toString('hex'),
      merkleRoot.toString('hex'),
      new Date(timestamp),
      bits,
      nonce,
    );
  }

  public serialize(): Buffer {
    const version = Buffer.alloc(4);
    version.writeUInt32LE(this.version);

    const previousBlock = Buffer.from(this.prevBlock, 'hex');

    const merkleRoot = Buffer.from(this.merkleRoot, 'hex');

    const timestamp = Buffer.alloc(4);
    version.writeUInt32LE(+this.timestamp);

    const bits = this.bits;

    const nonce = Buffer.alloc(4);
    nonce.writeUInt32BE(this.nonce);

    return Buffer.concat([
      version,
      previousBlock,
      merkleRoot,
      timestamp,
      bits,
      nonce,
    ]);
  }

  public hash(): Buffer {
    return hash256(this.serialize());
  }

  get checkProofOfWork() {
    const sha = hash256(this.serialize());
    const proof = littleEndianToBigInt(sha);

    return proof < this.target;
  }

  public export() {
    return {
      version: this.version,
      previousBlock: this.prevBlock,
      merkleRoot: this.merkleRoot,
      timestamp: this.timestamp,
      bits: this.bits,
      nonce: this.nonce,
    };
  }

  public setBitsByTarget(target: bigint) {
    const bytes = trimStart(bigIntToBigEndianBytes(target));

    let exponent = bytes.length;
    let coefficient: Buffer;

    if (bytes[0] & 0x80) {
      exponent++;
      coefficient = Buffer.concat([Buffer.from([0x00]), bytes]).subarray(0, 3);
    } else {
      coefficient = Buffer.concat([bytes, Buffer.alloc(3)]).subarray(0, 3);
    }

    this.bits = Buffer.concat([coefficient.reverse(), Buffer.from([exponent])]);
  }

  get target(): bigint {
    const exponent = BigInt(this.bits.at(-1) as number);
    const coefficient = BigInt(this.bits.readUIntLE(0, 3));
    return coefficient * 256n ** (exponent - 3n);
  }

  get difficulty(): number {
    return (0xffff * 256 ** (0x1d - 3)) / Number(this.target);
  }

  get isBIP9(): boolean {
    return this.version >> 29 === 0x0b001;
  }

  get isBIP91(): boolean {
    return ((this.version >> 4) & 1) === 1;
  }

  get isBIP141(): boolean {
    return ((this.version >> 1) & 1) === 1;
  }
}
