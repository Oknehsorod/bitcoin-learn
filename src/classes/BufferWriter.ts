import { sha256 } from '../utils/sha256';
import { hash256 } from '../utils/hash256';

export class BufferWriter {
  private buf: Buffer;

  constructor(buf = Buffer.alloc(0)) {
    this.buf = buf;
  }

  public append(newBuffer: Buffer) {
    this.buf = Buffer.concat([this.buf, newBuffer]);

    return this;
  }

  public writeUInt8(n: number) {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(n);

    this.append(buf);

    return this;
  }

  public writeUInt32LE(n: number) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(n);

    this.append(buf);

    return this;
  }

  public appendSHA256(newBuffer: Buffer) {
    this.append(sha256(newBuffer));

    return this;
  }

  public appendHash256(newBuffer: Buffer) {
    this.append(hash256(newBuffer));

    return this;
  }

  public getBuffer() {
    return this.buf;
  }
}
