import { hash256 } from '../../utils/hash256';
import { createHash } from 'node:crypto';
import { verifySignature } from '../../utils/verifySignature';
import { Signature } from '../../types/Signature';
import { decodeNum, encodeNum } from '../../utils/scriptNumberUtils';
import { decodeSEC } from '../../formats/sec';
import { decodeDER } from '../../formats/der';

const opDup = (stack: ScriptStack) => {
  if (stack.length < 1) return false;
  stack.push(stack.at(-1) as Buffer);
  return true;
};

const opHash256 = (stack: ScriptStack) => {
  if (stack.length < 1) return false;
  const element = stack.pop();
  stack.push(hash256(element as Buffer));
  return true;
};

const opHash160 = (stack: ScriptStack) => {
  if (stack.length < 1) return false;
  const element = stack.pop();
  stack.push(
    createHash('ripemd160')
      .update(
        createHash('sha256')
          .update(element as Buffer)
          .digest(),
      )
      .digest(),
  );
  return true;
};

const opAdd = (stack: ScriptStack): boolean => {
  if (stack.length < 2) return false;
  if (!Buffer.isBuffer(stack[0]) || !Buffer.isBuffer(stack[1])) return false;

  const a = decodeNum(stack.pop() as Buffer);
  const b = decodeNum(stack.pop() as Buffer);

  stack.push(encodeNum(a + b));

  return true;
};

const opEqual = (stack: ScriptStack): boolean => {
  if (stack.length < 2) return false;
  if (!Buffer.isBuffer(stack[0]) || !Buffer.isBuffer(stack[1])) return false;

  const a = decodeNum(stack.pop() as Buffer);
  const b = decodeNum(stack.pop() as Buffer);

  stack.push(a === b ? encodeNum(1) : encodeNum(0));

  return true;
};

const opZero = (stack: ScriptStack): boolean => {
  stack.push(encodeNum(0));
  return true;
};

const opOne = (stack: ScriptStack): boolean => {
  stack.push(encodeNum(1));
  return true;
};

const opTwo = (stack: ScriptStack): boolean => {
  stack.push(encodeNum(2));
  return true;
};

const opChecksig = (stack: ScriptStack): boolean => {
  if (stack.length < 2) return false;
  if (!Buffer.isBuffer(stack.at(-1)) || !Buffer.isBuffer(stack.at(-2)))
    return false;

  const a = stack.pop() as Buffer;
  const b = stack.pop() as Buffer;

  const result = verifySignature(decodeSEC(b), decodeDER(a) as Signature);

  stack.push(encodeNum(result ? 1 : 0));

  return true;
};

const opVerify = (stack: ScriptStack): boolean => {
  if (stack.length < 1) return false;
  if (!Buffer.isBuffer(stack.at(-1))) return false;

  const a = stack.pop() as Buffer;

  return a.length !== 0;
};

const opEqualVerify = (stack: ScriptStack): boolean => {
  return opEqual(stack) && opVerify(stack);
};

export enum OPFunctions {
  DUP = 118,
  HASH160 = 169,
  HASH256 = 170,
  ADD = 147,
  EQUAL = 135,
  CHECKSIG = 172,
  ZERO = 0,
  ONE = 81,
  TWO = 82,
  VERIFY = 105,
  EQUALVERIFY = 136,
}

export const OP_CODE_FUNCTIONS: Record<
  OPFunctions,
  (stack: ScriptStack) => boolean
> = {
  [OPFunctions.DUP]: opDup,
  [OPFunctions.HASH160]: opHash160,
  [OPFunctions.HASH256]: opHash256,
  [OPFunctions.ADD]: opAdd,
  [OPFunctions.EQUAL]: opEqual,
  [OPFunctions.CHECKSIG]: opChecksig,
  [OPFunctions.ZERO]: opZero,
  [OPFunctions.ONE]: opOne,
  [OPFunctions.TWO]: opTwo,
  [OPFunctions.VERIFY]: opVerify,
  [OPFunctions.EQUALVERIFY]: opEqualVerify,
};

export const OP_CODE_TO_ASM: Record<OPFunctions, string> = {
  [OPFunctions.DUP]: 'OP_DUP',
  [OPFunctions.HASH160]: 'OP_HASH160',
  [OPFunctions.HASH256]: 'OP_HASH256',
  [OPFunctions.ADD]: 'OP_ADD',
  [OPFunctions.EQUAL]: 'OP_EQUAL',
  [OPFunctions.CHECKSIG]: 'OP_CHECKSIG',
  [OPFunctions.ZERO]: 'OP_ZERO',
  [OPFunctions.ONE]: 'OP_ONE',
  [OPFunctions.TWO]: 'OP_TWO',
  [OPFunctions.VERIFY]: 'OP_VERIFY',
  [OPFunctions.EQUALVERIFY]: 'OP_EQUALVERIFY',
};

export type ScriptStack = (Buffer | number)[];
