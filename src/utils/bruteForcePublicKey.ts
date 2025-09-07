import { PublicKey } from '../types/PublicKey';
import { getPublicKey } from './getPublicKey';

export const bruteForcePublicKey = (publicKey: PublicKey): bigint => {
  let e = 1n;

  while (true) {
    const publicKeyCandidate = getPublicKey(e);
    console.log('e', e, publicKeyCandidate);
    if (
      publicKeyCandidate.x === publicKey.x &&
      publicKeyCandidate.y === publicKey.y
    )
      return e;
    e += 1n;
  }
};
