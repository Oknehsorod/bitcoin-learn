export const btcToSatoshi = (amount: number): bigint =>
  BigInt(amount * 100000000);
