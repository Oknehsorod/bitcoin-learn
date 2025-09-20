import {
  BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { createTaprootTree } from '../../utils/createTaprootTree';
import { hashTagged } from '../../utils/hashTagged';
import { N, G } from '../../utils/constants';
import { EllipticPoint } from '../../classes/EllipticCurve';
import {
  bigIntToBigEndianBytes,
  fromBigEndianBytesToBigInt,
} from '../../utils/bytesUtils';
import { bech32m } from 'bech32';
import { encodeScript } from '../script';
import { getPublicKey } from '../../utils/getPublicKey';
import { mod } from '../../utils/mod';

interface P2TRData {
  address: string;
  tweakedPublicKey: Buffer;
  tweakedPrivateKey: bigint;
}

const tweakTapRootSecretKey = (secretKey: bigint, merkleRoot: Buffer) => {
  const P = EllipticPoint.multiply(G, secretKey);

  let seckey = P.hasEvenY() ? secretKey : N - secretKey;

  const t = fromBigEndianBytesToBigInt(
    hashTagged(
      'TapTweak',
      Buffer.concat([
        bigIntToBigEndianBytes(P.getX()?.getValue()!),
        merkleRoot,
      ]),
    ),
  );

  if (t >= N) throw new Error('Kdlkfja');

  return mod(seckey + t, N);
};

export const encodeP2TR = (
  network: BitcoinNetworks,
  secret: bigint,
  scripts: Buffer[],
): P2TRData => {
  const merkleTree = createTaprootTree(scripts);

  const tweakedPrivateKey = tweakTapRootSecretKey(secret, merkleTree.hash);
  const tweakedPublicKey = bigIntToBigEndianBytes(
    getPublicKey(tweakedPrivateKey).x,
  );

  const words = bech32m.toWords(tweakedPublicKey);

  words.unshift(1);

  return {
    address: bech32m.encode(
      BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX[network],
      words,
    ),
    tweakedPublicKey,
    tweakedPrivateKey,
  };
};

export const decodeP2TR = (address: string) => {
  const decoded = bech32m.decode(address);

  const version = decoded.words[0];
  if (version !== 1) {
    throw new Error('Not a Taproot P2TR v1 address');
  }

  const program = bech32m.fromWords(decoded.words.slice(1));

  if (program.length !== 32) {
    throw new Error('Invalid P2TR program length (must be 32 bytes)');
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

export const getP2TRScriptPubKey = (address: string) =>
  encodeScript(`OP_1 ${decodeP2TR(address).hash.toString('hex')}`);
