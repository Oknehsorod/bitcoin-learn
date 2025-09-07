import {
  BITCOIN_NETWORK_TO_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { createHash } from 'node:crypto';
import { hash256 } from '../hash256';
import { encodeBase58 } from '../encodeBase58';

export const createAddress = (
  network: BitcoinNetworks,
  secKey: string,
): string => {
  const prefix = BITCOIN_NETWORK_TO_ADDRESS_PREFIX[network];
  const hashedKey = createHash('ripemd160')
    .update(createHash('sha256').update(Buffer.from(secKey, 'hex')).digest())
    .digest();
  const prefixAndHash = Buffer.concat([Buffer.from(prefix, 'hex'), hashedKey]);
  const checksum = hash256(prefixAndHash).subarray(0, 4);
  return encodeBase58(Buffer.concat([prefixAndHash, checksum]).toString('hex'));
};
