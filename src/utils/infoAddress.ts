import { getPublicKey } from './getPublicKey';
import { encodeSEC } from '../formats/sec';
import { encodeP2PKH, getP2PKHScriptPubKey } from '../formats/address/p2pkh';
import { BitcoinNetworks } from '../types/BitcoinNetworks';
import { encodeP2WPKH, getP2WPKHScriptPubKey } from '../formats/address/p2wpkh';
import { PublicKey } from '../types/PublicKey';
import { ScriptOutput } from '../formats/script';

interface Options {
  network: BitcoinNetworks;
  isCompressed: boolean;
}

interface AddressInfo {
  secret: bigint;
  isCompressed: boolean;
  network: BitcoinNetworks;
  publicKey: PublicKey;
  SECKey: Buffer;
  P2PKH: string;
  P2PKHPubKey: ScriptOutput;
  P2WPKH: string;
  P2WPKHPubKey: ScriptOutput;
}

export const infoAddress = (
  secret: bigint,
  options?: Partial<Options>,
): AddressInfo => {
  const { network = BitcoinNetworks.REGTEST, isCompressed = true } =
    options ?? {};

  const pubKey = getPublicKey(secret);
  const secKey = encodeSEC(pubKey, isCompressed);
  const p2pkh = encodeP2PKH(network, secKey);
  const p2pkhScriptPublicKey = getP2PKHScriptPubKey(p2pkh);
  const p2wpkh = encodeP2WPKH(network, secKey);
  const p2wpkhScriptPublicKey = getP2WPKHScriptPubKey(p2wpkh);

  console.log(`\n${'='.repeat(30)}`);
  console.log('Secret: ', secret);
  console.log('Public Key: ', pubKey);
  console.log(
    `SEC [${isCompressed ? 'Compressed' : 'Uncompressed'}] [${network}]: `,
    secKey.toString('hex'),
  );
  console.log('P2PKH: ', p2pkh, `[ ${p2pkhScriptPublicKey.asm} ]`);
  console.log('P2WPKH: ', p2wpkh, `[ ${p2wpkhScriptPublicKey.asm} ]`);
  console.log(`${'='.repeat(30)}\n`);

  return {
    network,
    isCompressed,
    secret,
    SECKey: secKey,
    publicKey: pubKey,
    P2WPKH: p2wpkh,
    P2PKH: p2pkh,
    P2PKHPubKey: p2pkhScriptPublicKey,
    P2WPKHPubKey: p2wpkhScriptPublicKey,
  };
};
