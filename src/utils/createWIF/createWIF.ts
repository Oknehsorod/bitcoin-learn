import {
  BITCOIN_NETWORK_TO_WIF_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { hash256 } from '../hash256';
import { encodeBase58 } from '../encodeBase58';
import { bigIntToBigEndianBytes } from '../bytesUtils';

export const createWIF = (
  network: BitcoinNetworks,
  secretKey: bigint,
  isCompressedPublicKey: boolean,
): string => {
  const prefix = BITCOIN_NETWORK_TO_WIF_PREFIX[network];
  const encodedKey = bigIntToBigEndianBytes(secretKey);
  const result = Buffer.concat([
    Buffer.from(prefix, 'hex'),
    encodedKey,
    ...(isCompressedPublicKey ? [Buffer.from('01', 'hex')] : []),
  ]);
  const checksum = hash256(result).subarray(0, 4);
  return encodeBase58(Buffer.concat([result, checksum]).toString('hex'));
};
