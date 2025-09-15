import { NetworkEnvelope } from './NetworkEnvelope';

describe('Basic NetworkEnvelope tests', () => {
  it('should parse and serialize correctly', () => {
    const input = Buffer.from(
      'f9beb4d976657261636b000000000000000000005df6e0e2',
      'hex',
    );
    const ne = NetworkEnvelope.parse(input);

    expect(ne.export().command).toBe('verack\0\0\0\0\0\0');
    expect(ne.export().payload).toHaveLength(0);

    expect(ne.serialize().toString('hex')).toBe(input.toString('hex'));
  });
});
