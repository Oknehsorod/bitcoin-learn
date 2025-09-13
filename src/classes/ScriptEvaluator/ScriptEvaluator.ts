import { BufferReader } from '../BufferReader';
import { encodeVarints, readVarints } from '../../utils/varintsUtils';
import {
  OP_CODE_FUNCTIONS,
  OP_CODE_TO_ASM,
  OPFunctions,
  ScriptStack,
} from './opFunctions';

export class ScriptEvaluator {
  readonly cmds: ScriptStack;

  static add(a: ScriptEvaluator, b: ScriptEvaluator) {
    return new ScriptEvaluator([...a.cmds, ...b.cmds]);
  }

  constructor(stack: ScriptStack = []) {
    this.cmds = stack;
  }

  public toASM(): string {
    return this.cmds
      .map((cmd) => {
        if (typeof cmd === 'number') return OP_CODE_TO_ASM[cmd as OPFunctions];
        return cmd.toString('hex');
      })
      .join(' ');
  }

  public fromASM(asm: string) {
    asm.split(' ').forEach((command) => {
      if (command.startsWith('OP')) {
        this.cmds.push(
          parseInt(
            Object.keys(OP_CODE_TO_ASM).find(
              (el) => OP_CODE_TO_ASM[parseInt(el) as OPFunctions] === command,
            ) as string,
          ),
        );
      } else {
        this.cmds.push(Buffer.from(command, 'hex'));
      }
    });
  }

  public getCmds(): ScriptStack {
    return this.cmds;
  }

  public evaluate(): boolean {
    const cmds = [...this.cmds];
    const stack: ScriptStack = [];
    const altStack: ScriptStack = [];

    while (cmds.length > 0) {
      const cmd = cmds.shift() as Buffer | number;

      if (typeof cmd === 'number') {
        const operation = OP_CODE_FUNCTIONS[cmd as OPFunctions];
        if (!operation) throw new Error('No such function ' + cmd);
        if (!operation(stack)) return false;
      } else {
        stack.push(cmd);
      }
    }

    const top = stack.pop() as Buffer | number;

    if (Buffer.isBuffer(top)) {
      return top.some((byte) => byte !== 0);
    }
    return top !== 0;
  }

  public parse(str: string, hasPrefix = false) {
    const buf = new BufferReader(Buffer.from(str, 'hex'));

    if (hasPrefix) {
      const length = readVarints(buf);

      if (buf.getBuffer().length !== length)
        throw new Error('Failed to parse script');
    }

    while (buf.getBuffer().length > 0) {
      const current = buf.consumeUInt8();
      if (current >= 1 && current <= 75) {
        this.cmds.push(buf.consume(current));
      } else if (current === 0x4c) {
        this.cmds.push(buf.consume(buf.consumeUInt8()));
      } else if (current === 0x4d) {
        this.cmds.push(buf.consume(buf.consumeUInt16LE()));
      } else if (current === 0x4e) {
        this.cmds.push(buf.consume(buf.consumeUInt32LE()));
      } else {
        this.cmds.push(current);
      }
    }
  }

  public serialize(hasPrefix = false): string {
    let buffer = Buffer.alloc(0);

    this.cmds.forEach((el) => {
      if (typeof el === 'number') {
        const value = Buffer.alloc(1);
        value.writeUInt8(el);
        buffer = Buffer.concat([buffer, value]);
      } else {
        const length = el.length;
        if (length < 75) {
          const value = Buffer.alloc(1);
          value.writeUInt8(length);

          buffer = Buffer.concat([buffer, value]);
        } else if (length >= 75 && length < 0x100) {
          const lengthBytes = Buffer.alloc(1);
          lengthBytes.writeUInt8(length);
          const markerBytes = Buffer.alloc(1);
          markerBytes.writeUInt8(76);

          buffer = Buffer.concat([buffer, markerBytes, lengthBytes]);
        } else if (length >= 0x100 && length <= 520) {
          const lengthBytes = Buffer.alloc(2);
          lengthBytes.writeUInt16LE(length);
          const markerBytes = Buffer.alloc(1);
          markerBytes.writeUInt8(77);

          buffer = Buffer.concat([buffer, markerBytes, lengthBytes]);
        } else {
          throw new Error('cmd is too long');
        }
        buffer = Buffer.concat([buffer, el]);
      }
    });

    return Buffer.concat([
      ...(hasPrefix ? [encodeVarints(buffer.length)] : []),
      buffer,
    ]).toString('hex');
  }
}
