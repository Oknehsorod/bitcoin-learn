import { decodeScript, encodeScript } from './script';

describe('Basic script utils tests', () => {
  it('should encode/decode in the same way', () => {
    const input = 'OP_1 OP_1 OP_ADD OP_2 OP_EQUAL';
    const output = '5151935287';
    const result = encodeScript(input);

    expect(result.buffer.toString('hex')).toBe(output);
    expect(decodeScript(result.buffer).asm).toBe(input);
  });

  it('should encode/decode script pub key', () => {
    const input =
      'OP_DUP OP_HASH160 751e76e8199196d454941c45d1b3a323f1433bd6 OP_EQUALVERIFY OP_CHECKSIG';
    const output = '76a914751e76e8199196d454941c45d1b3a323f1433bd688ac';
    const result = encodeScript(input);

    expect(result.buffer.toString('hex')).toBe(output);
    expect(decodeScript(result.buffer).asm).toBe(input);
  });
});
