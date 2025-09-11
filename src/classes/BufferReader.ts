export class BufferReader {
  private offset = 0;
  private readonly buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  private setOffset(newOffset: number) {
    this.offset = newOffset;
  }

  private get currentSlice() {
    return this.buf.subarray(this.offset);
  }

  public consume(len: number) {
    const newOffset = this.offset + len;
    const value = this.buf.subarray(this.offset, newOffset);
    this.setOffset(newOffset);
    return value;
  }

  public getBuffer() {
    return this.currentSlice;
  }

  public consumeFirstByte() {
    return this.consume(1)[0];
  }

  public consumeUInt8(): number {
    const value = this.currentSlice.readUInt8(0);
    this.consume(1);
    return value;
  }

  public consumeUInt16LE(): number {
    const value = this.currentSlice.readUInt16LE(0);
    this.consume(2);
    return value;
  }

  public consumeUInt32LE(): number {
    const value = this.currentSlice.readUInt32LE(0);
    this.consume(4);
    return value;
  }

  public consumeBigUInt64LE(): bigint {
    const value = this.currentSlice.readBigUInt64LE(0);
    this.consume(8);
    return value;
  }
}
