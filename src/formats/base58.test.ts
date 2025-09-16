import { decodeBase58, encodeBase58 } from './base58';

describe('Basic base58 tests', () => {
  it('should return valid base58 string', () => {
    const input = [
      '7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d',
      'eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c',
      'c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6',
      '00000000000000c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6',
    ];

    const output = [
      '9MA8fRQrT4u8Zj8ZRd6MAiiyaxb2Y1CMpvVkHQu5hVM6',
      '4fE3H2E6XMp4SsxtwinF7w9a34ooUrwWe4WsW1458Pd',
      'EQJsjkd6JaGwxrjEhfeqPenqHwrBmPQZjJGNSCHBkcF7',
      '1111111EQJsjkd6JaGwxrjEhfeqPenqHwrBmPQZjJGNSCHBkcF7',
    ];

    input.forEach((s, idx) => {
      const inp = Buffer.from(s, 'hex');
      expect(encodeBase58(inp)).toBe(output[idx]);
      expect(decodeBase58(encodeBase58(inp)).toString('hex')).toBe(s);
    });
  });
});
