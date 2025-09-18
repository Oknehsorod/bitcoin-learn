import {
  BITCOIN_NETWORK_TO_SH_PREFIX,
  BitcoinNetworks,
} from '../../types/BitcoinNetworks';
import { hash160 } from '../../utils/hash160';
import { decodeBase58, encodeBase58 } from '../base58';
import { hash256 } from '../../utils/hash256';
import { BufferReader } from '../../classes/BufferReader';
import { encodeScript } from '../script';

export const encodeP2SH = (network: BitcoinNetworks, script: Buffer) => {
  const redeemScriptHash = hash160(script);

  const prefix = Buffer.from(BITCOIN_NETWORK_TO_SH_PREFIX[network], 'hex');

  const checksum = hash256(Buffer.concat([prefix, redeemScriptHash])).subarray(
    0,
    4,
  );

  const payload = Buffer.concat([prefix, redeemScriptHash, checksum]);

  return encodeBase58(payload);
};

interface P2SHData {
  network: BitcoinNetworks;
  scriptHash: Buffer;
}

export const decodeP2SH = (val: string): P2SHData => {
  const buf = new BufferReader(decodeBase58(val));

  const prefix = buf.consume(1);
  const redeemScriptHash = buf.consume(20);
  const checksum = buf.consume(4);

  if (
    buf.getBuffer().length !== 0 ||
    !hash256(Buffer.concat([prefix, redeemScriptHash]))
      .subarray(0, 4)
      .equals(checksum)
  )
    throw new Error('Invalid address');

  return {
    network: Object.keys(BITCOIN_NETWORK_TO_SH_PREFIX).find(
      (key) =>
        BITCOIN_NETWORK_TO_SH_PREFIX[key as BitcoinNetworks] ===
        prefix.toString('hex'),
    ) as BitcoinNetworks,
    scriptHash: redeemScriptHash,
  };
};

export const getP2SHScriptPubKey = (address: string) =>
  encodeScript(
    `OP_HASH160 ${decodeP2SH(address).scriptHash.toString('hex')} OP_EQUAL`,
  );

export const getP2SHScriptSig = (redeemScript: Buffer, asm = ''): Buffer =>
  encodeScript(`${asm} ${redeemScript.toString('hex')}`).buffer;
