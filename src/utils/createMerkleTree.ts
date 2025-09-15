import { hash256 } from './hash256';

export const createMerkleTree = (input: Buffer[]): Buffer => {
  const hashedList = input.map((el) => hash256(el));
  if (hashedList.length === 1) return hashedList.at(0) as Buffer;

  const isOdd = hashedList.length % 2 !== 0;

  if (isOdd) hashedList.push(hashedList.at(-1) as Buffer);

  const result: Buffer[] = [];

  for (let i = 0; i < hashedList.length; i += 2) {
    result.push(hash256(Buffer.concat([hashedList[i], hashedList[i + 1]])));
  }

  return createMerkleTree(result);
};
