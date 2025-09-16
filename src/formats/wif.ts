import {
  BITCOIN_NETWORK_TO_WIF_PREFIX,
  BitcoinNetworks,
} from '../types/BitcoinNetworks';
import { bigIntToBigEndianBytes } from '../utils/bytesUtils';
import { hash256 } from '../utils/hash256';
import { decodeBase58, encodeBase58 } from './base58';
import { BufferReader } from '../classes/BufferReader';

interface WIFData {
  network: BitcoinNetworks;
  secretKey: bigint;
  isCompressedPublicKey: boolean;
}

export const encodeWIF = (
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
  return encodeBase58(Buffer.concat([result, checksum]));
};

export const decodeWIF = (val: string): WIFData => {
  const buf = new BufferReader(decodeBase58(val));

  const prefix = buf.consume(1).toString('hex');
  const secretKey = BigInt('0x' + buf.consume(32).toString('hex'));
  const isCompressedPublicKey =
    buf.getBuffer().length === 5 &&
    buf.getBuffer().subarray(0, 1).toString('hex') === '01';
  if (isCompressedPublicKey) buf.consume(1);

  const checksum = buf.consume(4);

  const result = Buffer.concat([
    Buffer.from(prefix, 'hex'),
    bigIntToBigEndianBytes(secretKey),
    ...(isCompressedPublicKey ? [Buffer.from('01', 'hex')] : []),
  ]);

  if (!checksum.equals(hash256(result).subarray(0, 4)))
    throw new Error('Invalid checksum');

  return {
    network: Object.keys(BITCOIN_NETWORK_TO_WIF_PREFIX).find(
      (key) => BITCOIN_NETWORK_TO_WIF_PREFIX[key as BitcoinNetworks] === prefix,
    ) as BitcoinNetworks,
    secretKey,
    isCompressedPublicKey,
  };
};
