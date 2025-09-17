import { createHash } from 'node:crypto';
import { bech32 } from 'bech32';
import {
  BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';

interface P2PWSHData {
  network: BitcoinNetworks;
  hash: Buffer;
}

export const encodeP2WSH = (network: BitcoinNetworks, script: Buffer) => {
  const scriptHash = createHash('sha256').update(script).digest();

  const words = bech32.toWords(scriptHash);

  words.unshift(0);

  return bech32.encode(
    BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[network],
    words,
  );
};

export const decodeP2WSH = (address: string): P2PWSHData => {
  const decoded = bech32.decode(address);

  const version = decoded.words[0];
  if (version !== 0) {
    throw new Error('Not a P2WSH v0 address');
  }

  const program = bech32.fromWords(decoded.words.slice(1));

  if (program.length !== 32) {
    throw new Error('Invalid P2WSH program length (must be 32 bytes)');
  }

  return {
    network: Object.keys(BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX).find(
      (key) =>
        BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[key as BitcoinNetworks] ===
        decoded.prefix,
    ) as BitcoinNetworks,
    hash: Buffer.from(program),
  };
};
