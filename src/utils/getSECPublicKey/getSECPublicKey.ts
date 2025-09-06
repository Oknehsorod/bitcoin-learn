import { PublicKey } from '../../types/PublicKey';

const bigintTo32BytesHex = (a: bigint) => a.toString(16).padStart(64, '0');

export const getSECPublicKey = (
  { x, y }: PublicKey,
  isCompressed = false,
): string => {
  if (!isCompressed)
    return `04${bigintTo32BytesHex(x)}${bigintTo32BytesHex(y)}`;

  if (y % 2n === 0n) return `02${bigintTo32BytesHex(x)}`;

  return `03${bigintTo32BytesHex(x)}`;
};
