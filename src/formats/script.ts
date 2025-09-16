import { BufferReader } from '../classes/BufferReader';
import { isNil } from 'lodash';

const OP_CODE = {
  '0': 0x00,
  FALSE: 0x00,
  PUSHDATA1: 0x4c,
  PUSHDATA2: 0x4d,
  PUSHDATA4: 0x4e,
  ONENEGATE: 0x4f,
  '1': 0x51,
  TRUE: 0x51,
  '2': 0x52,
  '3': 0x53,
  '4': 0x54,
  '5': 0x55,
  '6': 0x56,
  '7': 0x57,
  '8': 0x58,
  '9': 0x59,
  '10': 0x5a,
  '11': 0x5b,
  '12': 0x5c,
  '13': 0x5d,
  '14': 0x5e,
  '15': 0x5f,
  '16': 0x60,
  ADD: 0x93,
  EQUAL: 0x87,
  DUP: 0x76,
  HASH160: 0xa9,
  EQUALVERIFY: 0x88,
  CHECKSIG: 0xac,
};

type OPCodeKeys = keyof typeof OP_CODE;

const OP_CODE_TO_ASM: Record<OPCodeKeys, string> = Object.keys(OP_CODE).reduce(
  (acc, cur) => ({
    ...acc,
    [cur as keyof typeof OP_CODE]: `OP_${cur}`,
  }),
  {} as Record<OPCodeKeys, string>,
);

const ASM_TO_OP_CODE = Object.keys(OP_CODE).reduce<Record<string, number>>(
  (acc, cur) => ({
    ...acc,
    [`OP_${cur}`]: OP_CODE[cur as OPCodeKeys],
  }),
  {} as Record<string, number>,
);

const NUMBER_TO_OP_CODE: Record<number, OPCodeKeys> = Object.keys(
  OP_CODE,
).reduce(
  (acc, cur) => ({
    [OP_CODE[cur as keyof typeof OP_CODE]]: cur,
    ...acc,
  }),
  {},
);

type ParsedScript = (number | Buffer)[];

interface ScriptOutput {
  buffer: Buffer;
  asm: string;
  parsed: ParsedScript;
}

export const encodeScript = (asm: string): ScriptOutput => {
  const result: Buffer[] = [];
  const parsed: ParsedScript = [];

  asm.split(' ').forEach((el) => {
    const opCode = ASM_TO_OP_CODE[el];

    if (isNil(opCode)) {
      const scriptData = Buffer.from(el, 'hex');
      const dataLength = scriptData.length;

      if (dataLength >= 0x01 && dataLength <= 0x4b) {
        result.push(Buffer.concat([Buffer.from([dataLength]), scriptData]));
      } else if (dataLength > 0x4b && dataLength <= 0xff) {
        result.push(
          Buffer.concat([
            Buffer.from([OP_CODE.PUSHDATA1, dataLength]),
            scriptData,
          ]),
        );
      } else if (dataLength > 0xff && dataLength <= 0xffff) {
        const dataLengthBuffer = Buffer.alloc(2);
        dataLengthBuffer.writeUInt16LE(dataLength);
        result.push(
          Buffer.concat([
            Buffer.from([OP_CODE.PUSHDATA2]),
            dataLengthBuffer,
            scriptData,
          ]),
        );
      } else if (dataLength > 0xffff && dataLength <= 0xffffffff) {
        const dataLengthBuffer = Buffer.alloc(4);
        dataLengthBuffer.writeUInt32LE(dataLength);
        result.push(
          Buffer.concat([
            Buffer.from([OP_CODE.PUSHDATA4]),
            dataLengthBuffer,
            scriptData,
          ]),
        );
      }
      parsed.push(scriptData);
    } else {
      result.push(Buffer.from([opCode]));
      parsed.push(opCode);
    }
  });

  return {
    buffer: Buffer.concat(result),
    parsed,
    asm,
  };
};

export const decodeScript = (scriptToCompile: Buffer): ScriptOutput => {
  const buf = new BufferReader(scriptToCompile);
  let result: string[] = [];
  const parsed: ParsedScript = [];

  while (buf.getBuffer().length !== 0) {
    const rawNumber = buf.consumeUInt8();
    const opCode = NUMBER_TO_OP_CODE[rawNumber];

    if (rawNumber >= 0x01 && rawNumber <= 0x4b) {
      const value = buf.consume(rawNumber);
      parsed.push(value);
      result.push(value.toString('hex'));
    } else if (opCode === 'PUSHDATA1') {
      const value = buf.consume(buf.consumeUInt8());
      parsed.push(value);
      result.push(value.toString('hex'));
    } else if (opCode === 'PUSHDATA2') {
      const value = buf.consume(buf.consumeUInt16LE());
      parsed.push(value);
      result.push(value.toString('hex'));
    } else if (opCode === 'PUSHDATA4') {
      const value = buf.consume(buf.consumeUInt32LE());
      parsed.push(value);
      result.push(value.toString('hex'));
    } else if (!isNil(opCode)) {
      result.push(OP_CODE_TO_ASM[opCode]);
      parsed.push(rawNumber);
    } else {
      throw new Error(`Unknown OP Code: ${rawNumber}`);
    }
  }

  return {
    asm: result.join(' '),
    buffer: scriptToCompile,
    parsed,
  };
};
