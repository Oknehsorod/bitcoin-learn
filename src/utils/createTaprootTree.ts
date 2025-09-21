import { encodeVarInt } from './varintsUtils';
import { hashTagged } from './hashTagged';

export type Node = {
  hash: Buffer;
  left: Node | null;
  right: Node | null;
  leafScript: Buffer | null;
};

export const TAPROOT_LEAF_VERSION = Buffer.from([0xc0]);

const hashBranch = (a: Buffer, b: Buffer): Buffer => {
  if (a.compare(b) === -1)
    return hashTagged('TapBranch', Buffer.concat([a, b]));
  return hashTagged('TapBranch', Buffer.concat([b, a]));
};

export const getTaprootPath = (node: Node, script: Buffer): Buffer[] | null => {
  const traverse = (
    currentNode: Node | null,
    targetScript: Buffer,
  ): Buffer[] | null => {
    if (!currentNode) return null;

    if (currentNode.leafScript?.equals(targetScript)) return [];

    if (currentNode.left) {
      const leftPath = traverse(currentNode.left, targetScript);
      if (leftPath) {
        if (currentNode.right) leftPath.push(currentNode.right.hash);
        return leftPath;
      }
    }

    if (currentNode.right) {
      const rightPath = traverse(currentNode.right, targetScript);
      if (rightPath) {
        if (currentNode.left) rightPath.push(currentNode.left.hash);
        return rightPath;
      }
    }

    return null;
  };

  return traverse(node, script);
};

export const createTaprootTree = (scripts: Buffer[]) => {
  const leaves: Node[] = scripts.map((script) => ({
    hash: hashTagged(
      'TapLeaf',
      Buffer.concat([
        TAPROOT_LEAF_VERSION,
        encodeVarInt(script.length),
        script,
      ]),
    ),
    left: null,
    right: null,
    leafScript: script,
  }));

  const buildMerkleTree = (leafHashes: Node[]): Node => {
    if (leafHashes.length === 1) return leafHashes[0]!;

    const [a, b] = leafHashes.slice(0, 2);

    const branch = hashBranch(a!.hash, b!.hash);

    return buildMerkleTree([
      {
        hash: branch,
        left: a!,
        right: b!,
        leafScript: null,
      },
      ...leafHashes.slice(2),
    ]);
  };

  return buildMerkleTree(leaves);
};
