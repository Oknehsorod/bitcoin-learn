import { BitcoinNetworks } from '../types/BitcoinNetworks';
import { encodeP2SH, getP2SHScriptPubKey } from '../formats/address/p2sh';
import { encodeScript, ScriptOutput } from '../formats/script';
import { encodeP2WSH, getP2WSHScriptPubKey } from '../formats/address/p2wsh';

interface InfoScriptOptions {
  network: BitcoinNetworks;
}

interface InfoScript {
  script: ScriptOutput;
  P2SH: string;
  P2SHPubKey: ScriptOutput;
  P2WSH: string;
  P2WSHPubKey: ScriptOutput;
}

export const infoScript = (
  asm: string,
  options: Partial<InfoScriptOptions> = {},
): InfoScript => {
  const { network = BitcoinNetworks.REGTEST } = options;

  const script = encodeScript(asm);

  const p2sh = encodeP2SH(network, script.buffer);
  const p2shPubKey = getP2SHScriptPubKey(p2sh);
  const p2wsh = encodeP2WSH(network, script.buffer);
  const p2wshPubKey = getP2WSHScriptPubKey(p2wsh);

  console.log(`\n${'='.repeat(30)}`);
  console.log('P2SH: ', p2sh, `\n[ ${p2shPubKey.asm} ]`);
  console.log('P2WSH: ', p2wsh, `\n[ ${p2wshPubKey.asm} ]`);
  console.log('ASM: ', asm);
  console.log('HEX: ', script.buffer.toString('hex'));
  console.log(`${'='.repeat(30)}\n`);

  return {
    script: script,
    P2SH: p2sh,
    P2SHPubKey: p2shPubKey,
    P2WSH: p2wsh,
    P2WSHPubKey: p2wshPubKey,
  };
};
