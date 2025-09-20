import { encodeScript } from '../formats/script';
import { createTaprootTree, getTaprootPath } from './createTaprootTree';

describe('Basic createTaprootTree tests', () => {
  it('should return correct merkle path', () => {
    const scripts = new Array(5)
      .fill(null)
      .map((_, idx) => encodeScript(`OP_${idx + 1} OP_EQUAL`).buffer);

    const tree = createTaprootTree(scripts);

    const path = getTaprootPath(tree, scripts[0]!);

    expect(path?.map((el) => el.toString('hex'))).toEqual(
      [
        tree.left?.left?.left?.right?.hash,
        tree.left?.left?.right?.hash,
        tree.left?.right?.hash,
        tree.right?.hash,
      ].map((el) => el?.toString('hex')),
    );
  });
});
