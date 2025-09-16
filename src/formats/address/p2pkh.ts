import {
  BITCOIN_NETWORK_TO_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { hash256 } from '../../utils/hash256';
import { decodeBase58, encodeBase58 } from '../base58';
import { hash160 } from '../../utils/hash160';
import { BufferReader } from '../../classes/BufferReader';

export const encodeP2PKH = (
  network: BitcoinNetworks,
  SECKey: Buffer,
): string => {
  const prefix = BITCOIN_NETWORK_TO_ADDRESS_PREFIX[network];
  const hashedKey = hash160(SECKey);
  const prefixAndHash = Buffer.concat([Buffer.from(prefix, 'hex'), hashedKey]);
  const checksum = hash256(prefixAndHash).subarray(0, 4);
  return encodeBase58(Buffer.concat([prefixAndHash, checksum]));
};

interface P2PKHData {
  network: BitcoinNetworks;
  hash: Buffer;
}

export const decodeP2PKH = (address: string): P2PKHData => {
  const buf = new BufferReader(decodeBase58(address));

  const prefix = buf.consume(1);
  const hash = buf.consume(20);
  const checksum = buf.consume(4);

  if (
    buf.getBuffer().length !== 0 ||
    !hash256(Buffer.concat([prefix, hash]))
      .subarray(0, 4)
      .equals(checksum)
  )
    throw new Error('Invalid address');

  return {
    network: Object.keys(BITCOIN_NETWORK_TO_ADDRESS_PREFIX).find(
      (key) =>
        BITCOIN_NETWORK_TO_ADDRESS_PREFIX[key as BitcoinNetworks] ===
        prefix.toString('hex'),
    ) as BitcoinNetworks,
    hash,
  };
};
