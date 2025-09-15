import {
  BITCOIN_NETWORK_TO_MAGIC,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { BufferReader } from '../BufferReader';
import { hash256 } from '../../utils/hash256';

export class NetworkEnvelope {
  private magic: BitcoinNetworks;
  private payload: Buffer;
  private command: string;

  constructor(magic: Buffer, command: string, payload: Buffer) {
    this.magic =
      magic.toString('hex') ===
      Buffer.from(
        BITCOIN_NETWORK_TO_MAGIC[BitcoinNetworks.MAINNET],
        'hex',
      ).toString('hex')
        ? BitcoinNetworks.MAINNET
        : BitcoinNetworks.TESTNET;

    this.command = command;
    this.payload = payload;
  }

  static parse(input: Buffer): NetworkEnvelope {
    const buf = new BufferReader(input);

    const magic = buf.consume(4);
    const command = buf.consume(12).toString('ascii');
    const payloadLength = buf.consumeUInt32LE();
    buf.consume(4); // checksum
    const payload = buf.consume(payloadLength);

    return new NetworkEnvelope(magic, command, payload);
  }

  public serialize(): Buffer {
    const payloadLength = Buffer.alloc(4);
    payloadLength.writeUInt32LE(this.payload.length);
    return Buffer.concat([
      Buffer.from(BITCOIN_NETWORK_TO_MAGIC[this.magic], 'hex'),
      Buffer.from(this.command, 'ascii'),
      payloadLength,
      hash256(this.payload).subarray(0, 4),
      this.payload,
    ]);
  }

  public export() {
    return {
      magic: this.magic,
      command: this.command,
      payload: this.payload,
    };
  }
}
