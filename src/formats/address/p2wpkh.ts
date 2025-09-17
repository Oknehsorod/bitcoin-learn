import { bech32 } from 'bech32';
import { hash160 } from '../../utils/hash160';
import {
  BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { encodeScript } from '../script';

interface P2PWKHData {
  network: BitcoinNetworks;
  hash: Buffer;
}

export const encodeP2WPKH = (
  network: BitcoinNetworks,
  secKey: Buffer,
): string => {
  const pubkeyHash = hash160(secKey);

  const words = bech32.toWords(pubkeyHash);

  words.unshift(0);

  return bech32.encode(
    BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[network],
    words,
  );
};

export const decodeP2WPKH = (address: string): P2PWKHData => {
  const decoded = bech32.decode(address);

  const version = decoded.words[0];
  if (version !== 0) {
    throw new Error('Not a P2WPKH v0 address');
  }

  const program = bech32.fromWords(decoded.words.slice(1));

  if (program.length !== 20) {
    throw new Error('Invalid P2WPKH program length (must be 20 bytes)');
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

export const getP2WPKHScriptPubKey = (address: string) =>
  encodeScript(
    `OP_DUP OP_HASH160 ${decodeP2WPKH(address).hash.toString('hex')} OP_EQUALVERIFY OP_CHECKSIG`,
  );

export const getP2WPKHWitness = (signature: Buffer, pubKey: Buffer) => [
  signature,
  pubKey,
];
