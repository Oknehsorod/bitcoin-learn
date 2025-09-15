import { createHash } from 'node:crypto';
import { bech32 } from 'bech32';
import {
  BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../types/BitcoinNetworks';

export const createP2WSHAddress = (
  network: BitcoinNetworks,
  script: Buffer,
) => {
  const scriptHash = createHash('sha256').update(script).digest();

  const words = bech32.toWords(scriptHash);

  words.unshift(0);

  return bech32.encode(
    BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[network],
    words,
  );
};
