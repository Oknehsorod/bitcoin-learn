import { ScriptEvaluator } from './ScriptEvaluator';
import { encodeVarints } from '../../utils/varintsUtils';
import { ScriptStack } from './opFunctions';

const getScriptWithLength = (script: string) => {
  const buf = Buffer.from(script, 'hex');
  return Buffer.concat([encodeVarints(buf.length), buf]).toString('hex');
};

describe('Basic ScriptEvaluator tests', () => {
  it('should parse script correctly', () => {
    const scripts = [
      'a914a34772f9598f37c35b41031bb366acdc829b5d2187',
      '5151935287',
    ];

    scripts.forEach((script) => {
      const sv = new ScriptEvaluator();
      const scriptWithLength = getScriptWithLength(script);

      sv.parse(scriptWithLength);
      expect(sv.serialize()).toBe(scriptWithLength);
    });
  });

  it('should evaluate script correctly', () => {
    const scripts: [string, boolean][] = [['5151935287', true]];

    scripts.forEach(([script, result]) => {
      const sv = new ScriptEvaluator();
      const scriptWithLength = getScriptWithLength(script);

      sv.parse(scriptWithLength);
      expect(sv.evaluate()).toBe(result);
    });
  });

  it('should show ASM correctly', () => {
    const input: [string, string][] = [
      [
        '76a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac',
        'OP_DUP OP_HASH160 06afd46bcdfd22ef94ac122aa11f241244a37ecc OP_EQUALVERIFY OP_CHECKSIG',
      ],
      ['5151935287', 'OP_ONE OP_ONE OP_ADD OP_TWO OP_EQUAL'],
    ];

    input.forEach(([a, b]) => {
      const scriptEvaluator = new ScriptEvaluator();
      scriptEvaluator.parse(a);

      expect(scriptEvaluator.toASM()).toBe(b);
    });
  });

  it('should read ASM correctly', () => {
    const input: [string, ScriptStack][] = [
      [
        'OP_DUP OP_HASH160 06afd46bcdfd22ef94ac122aa11f241244a37ecc OP_EQUALVERIFY OP_CHECKSIG',
        [
          118,
          169,
          Buffer.from('06afd46bcdfd22ef94ac122aa11f241244a37ecc', 'hex'),
          136,
          172,
        ],
      ],
    ];

    input.forEach(([a, b]) => {
      const scriptEvaluator = new ScriptEvaluator();
      scriptEvaluator.fromASM(a);

      expect(scriptEvaluator.toASM()).toBe(a);
      expect(scriptEvaluator.getCmds()).toEqual(b);
    });
  });
});
