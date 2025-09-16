import { getPublicKey } from '../utils/getPublicKey';
import { decodeSEC, encodeSEC } from './sec';

describe('Basic SEC public keys tests', () => {
  it('should return valid uncompressed public keys from secret ones', () => {
    const secrets = [5000n, 2018n ** 5n, BigInt('0xdeadbeef12345')];
    const correctPublicKeys = [
      '04ffe558e388852f0120e46af2d1b370f85854a8eb0841811ece0e3e03d282d57c315dc72890a4f10a1481c031b03b351b0dc79901ca18a00cf009dbdb157a1d10',
      '04027f3da1918455e03c46f659266a1bb5204e959db7364d2f473bdf8f0a13cc9dff87647fd023c13b4a4994f17691895806e1b40b57f4fd22581a4f46851f3b06',
      '04d90cd625ee87dd38656dd95cf79f65f60f7273b67d3096e68bd81e4f5342691f842efa762fd59961d0e99803c61edba8b3e3f7dc3a341836f97733aebf987121',
    ];

    secrets.forEach((secret, idx) => {
      const publicKey = getPublicKey(secret);
      const uncompressedSerializedKey = encodeSEC(publicKey);

      expect(uncompressedSerializedKey.toString('hex')).toBe(
        correctPublicKeys[idx],
      );
    });
  });

  it('should return valid compressed public keys from secret ones', () => {
    const secrets = [5001n, 2019n ** 5n, BigInt('0xdeadbeef54321')];
    const correctPublicKeys = [
      '0357a4f368868a8a6d572991e484e664810ff14c05c0fa023275251151fe0e53d1',
      '02933ec2d2b111b92737ec12f1c5d20f3233a0ad21cd8b36d0bca7a0cfa5cb8701',
      '0296be5b1292f6c856b3c5654e886fc13511462059089cdf9c479623bfcbe77690',
    ];

    secrets.forEach((secret, idx) => {
      const publicKey = getPublicKey(secret);
      const compressedSerializedKey = encodeSEC(publicKey, true);

      expect(compressedSerializedKey.toString('hex')).toBe(
        correctPublicKeys[idx],
      );
    });
  });

  it('should correctly parse various sec public keys', () => {
    const secrets = [5001n, 2019n ** 5n, BigInt('0xdeadbeef54321')];

    secrets.forEach((secret) => {
      const publicKey = getPublicKey(secret);
      const uncompressedSerializedKey = encodeSEC(publicKey);
      const compressedSerializedKey = encodeSEC(publicKey, true);

      expect(decodeSEC(uncompressedSerializedKey)).toEqual(publicKey);
      expect(decodeSEC(compressedSerializedKey)).toEqual(publicKey);
    });
  });
});
