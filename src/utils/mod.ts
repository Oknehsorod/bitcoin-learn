export const mod = (a: bigint, b: bigint) => {
  const result = a % b;
  if (result < 0) return result + b;
  return result;
};
