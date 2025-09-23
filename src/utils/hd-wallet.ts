import { createHmac, randomBytes } from 'node:crypto';
import {
  bigIntToBigEndianBytes,
  fromBigEndianBytesToBigInt,
} from './bytesUtils';
import { getPublicKey } from './getPublicKey';
import { encodeSEC } from '../formats/sec';
import { mod } from './mod';
import { N } from './constants';
import { encodeBase58 } from '../formats/base58';
import {
  BITCOIN_NETWORK_TO_PRIVATE_HD_KEY,
  BITCOIN_NETWORK_TO_PUBLIC_HD_KEY,
  BitcoinNetworks,
} from '../types/BitcoinNetworks';
import { hash160 } from './hash160';
import { hash256 } from './hash256';

const hmacSHA512 = (key: Buffer, value: Buffer) =>
  createHmac('sha512', key).update(value).digest();

const HARDENED_CHILD_KEYS_START_INDEX = 2 ** 31;

type ExtendedKey = [Buffer, Buffer];

export interface HDWData {
  public: string;
  private: string;
}

export const getHDW = (
  master: ExtendedKey,
  path: string,
  network: BitcoinNetworks,
): HDWData => {
  const splitPath = path.split('/');

  if (splitPath[0] !== 'm') throw new Error('Wrong path');

  const depth = splitPath.length - 1;

  const keys: ExtendedKey[] = [];
  const indexes: number[] = [];

  for (const currentElement of splitPath) {
    if (currentElement === 'm') {
      keys.push(master);
      continue;
    }

    const index = currentElement.endsWith("'")
      ? HARDENED_CHILD_KEYS_START_INDEX + parseInt(currentElement.slice(0, -1))
      : parseInt(currentElement);

    indexes.push(index);

    keys.push(CKDPriv(keys.at(-1)!, index));
  }

  const index = depth === 0 ? 0 : indexes.at(-1)!;
  const parentKey = keys.at(-2) ?? null;
  const privateKey = keys.at(-1)!;
  const publicKey = getPublicKey(fromBigEndianBytesToBigInt(privateKey[0]));

  return {
    private: serialize({
      parentKey,
      depth,
      network,
      extendedKey: privateKey,
      index,
    }),
    public: serialize({
      parentKey,
      depth,
      network,
      extendedKey: [encodeSEC(publicKey), privateKey[1]],
      index,
    }),
  };
};

export const CKDPriv = ([kPar, cPar]: ExtendedKey, i: number): ExtendedKey => {
  const isHardenedChildKey = i >= HARDENED_CHILD_KEYS_START_INDEX;

  const iBuf = Buffer.alloc(4);
  iBuf.writeUInt32BE(i);

  const I = hmacSHA512(
    cPar,
    isHardenedChildKey
      ? Buffer.concat([Buffer.from([0x00]), kPar, iBuf])
      : Buffer.concat([
          encodeSEC(getPublicKey(fromBigEndianBytesToBigInt(kPar))),
          iBuf,
        ]),
  );

  const IL = I.subarray(0, 32);
  const IR = I.subarray(32);

  const ILValue = fromBigEndianBytesToBigInt(IL);

  const kI = mod(ILValue + fromBigEndianBytesToBigInt(kPar), N);

  if (ILValue >= N || kI === 0n) return CKDPriv([kPar, cPar], i + 1);

  return [bigIntToBigEndianBytes(kI), IR];
};

export const getMasterKey = (seed = randomBytes(32)): ExtendedKey => {
  const I = hmacSHA512(Buffer.from('Bitcoin seed', 'utf-8'), seed);

  const IL = I.subarray(0, 32);
  const IR = I.subarray(32, 64);

  if (
    fromBigEndianBytesToBigInt(IL) === 0n ||
    fromBigEndianBytesToBigInt(IL) >= N
  )
    throw new Error('Invalid master key');

  return [IL, IR];
};

interface SerializationOptions {
  parentKey: ExtendedKey | null;
  network: BitcoinNetworks;
  depth: number;
  extendedKey: ExtendedKey;
  index: number;
}

export const serialize = ({
  parentKey,
  network,
  depth,
  extendedKey,
  index,
}: SerializationOptions): string => {
  const isPublic = extendedKey[0].length === 33;
  const isMaster = depth === 0;

  const versionBytes = Buffer.from(
    isPublic
      ? BITCOIN_NETWORK_TO_PUBLIC_HD_KEY[network]
      : BITCOIN_NETWORK_TO_PRIVATE_HD_KEY[network],
    'hex',
  );

  const depthByte = Buffer.alloc(1);
  depthByte.writeUInt8(depth);

  const fingerprintBytes = Buffer.alloc(4, 0x00);

  if (!isMaster) {
    fingerprintBytes.set(
      hash160(
        encodeSEC(getPublicKey(fromBigEndianBytesToBigInt(parentKey![0]))),
      ).subarray(0, 4),
    );
  }

  const childNumberBytes = Buffer.alloc(4, 0x00);
  if (!isMaster) {
    childNumberBytes.writeUInt32BE(index);
  }

  const chainCodeBytes = extendedKey[1];
  const keyBytes = isPublic
    ? extendedKey[0]
    : Buffer.concat([Buffer.from([0x00]), extendedKey[0]]);

  const result = Buffer.concat([
    versionBytes,
    depthByte,
    fingerprintBytes,
    childNumberBytes,
    chainCodeBytes,
    keyBytes,
  ]);

  const checksum = hash256(result).subarray(0, 4);

  return encodeBase58(Buffer.concat([result, checksum]));
};
