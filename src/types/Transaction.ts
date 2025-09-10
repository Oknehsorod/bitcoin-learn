export interface Transaction {
  version: number;
  input: {
    prevTxID: string;
    prevIndex: number;
    scriptSig: string;
    sequence: number;
  }[];
  output: {
    amount: bigint;
    pubKey: string;
  }[];
  locktime: number;
}
