export type TransactionInput = {
  previousTransactionID: string;
  previousTransactionOutputIndex: number;
  scriptSignature: Buffer;
  sequence: number;
};

export type TransactionOutput = {
  amount: bigint;
  scriptPublicKey: Buffer;
};

export interface CredentialKey {
  secretKey: bigint;
  isPublicKeyCompressed: boolean;
}

export interface TransactionExport {
  lockTime: number;
  version: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
