import { BitcoinNetworks } from '../types/BitcoinNetworks';
import { createTaprootTree, Node } from './createTaprootTree';
import { encodeScript, ScriptOutput } from '../formats/script';
import { encodeP2TR, getP2TRScriptPubKey } from '../formats/address/p2tr';

interface InfoTaprootOptions {
  network: BitcoinNetworks;
}

interface TaprootInfo {
  P2TR: string;
  P2TRPubKey: ScriptOutput;
  merkleTree: Node;
  tweakedPublicKey: Buffer;
  tweakedPrivateKey: bigint;
}

export const infoTaproot = (
  secret: bigint,
  asms: string[],
  options: Partial<InfoTaprootOptions> = {},
): TaprootInfo => {
  const scripts = asms.map((asm) => encodeScript(asm).buffer);
  const { network = BitcoinNetworks.REGTEST } = options;

  const P2TR = encodeP2TR(network, secret, scripts);
  const P2TRPubKey = getP2TRScriptPubKey(P2TR.address);
  const merkleTree = createTaprootTree(scripts);

  console.log(`\n${'='.repeat(30)}`);
  console.log('Tweaked Public Key: ', P2TR.tweakedPublicKey.toString('hex'));
  console.log('P2TR: ', P2TR, `[ ${P2TRPubKey.asm} ]`);
  console.log('ASM: \n', asms.join('\n'));
  console.log(`${'='.repeat(30)}\n`);

  return {
    P2TR: P2TR.address,
    P2TRPubKey: P2TRPubKey,
    merkleTree,
    tweakedPublicKey: P2TR.tweakedPublicKey,
    tweakedPrivateKey: P2TR.tweakedPrivateKey,
  };
};
