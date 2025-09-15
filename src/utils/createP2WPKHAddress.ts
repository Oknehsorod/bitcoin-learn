import { bech32 } from 'bech32';
import { hash160 } from './hash160';
import {
  BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../types/BitcoinNetworks';

export const createP2WPKHAddress = (
  network: BitcoinNetworks,
  secKeyHex: string,
): string => {
  const pubkeyHash = hash160(Buffer.from(secKeyHex, 'hex'));

  const words = bech32.toWords(pubkeyHash);

  words.unshift(0);

  return bech32.encode(
    BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[network],
    words,
  );
};
