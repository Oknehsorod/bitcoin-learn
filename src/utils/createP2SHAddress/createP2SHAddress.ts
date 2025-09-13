import { hash160 } from '../hash160';
import {
  BITCOIN_NETWORK_TO_SH_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { createHash } from 'node:crypto';
import { encodeBase58 } from '../encodeBase58';

export const createP2SHAddress = (network: BitcoinNetworks, script: Buffer) => {
  const redeemScriptHash = hash160(script);

  const prefix = Buffer.from(BITCOIN_NETWORK_TO_SH_PREFIX[network], 'hex');

  const combined = Buffer.concat([prefix, redeemScriptHash]);

  const checksum = createHash('sha256')
    .update(createHash('sha256').update(combined).digest())
    .digest()
    .subarray(0, 4);

  const payload = Buffer.concat([prefix, redeemScriptHash, checksum]);

  return encodeBase58(payload.toString('hex'));
};
