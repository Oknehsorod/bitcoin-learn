import { Transaction } from './Transaction';
import { SignatureHashType } from '../../types/SignatureHashType';
import { encodeSEC } from '../../formats/sec';
import { getPublicKey } from '../../utils/getPublicKey';
import { encodeScript } from '../../formats/script';
import {
  encodeP2PKH,
  getP2PKHScriptPubKey,
  getP2PKHScriptSig,
} from '../../formats/address/p2pkh';
import { BitcoinNetworks } from '../../types/BitcoinNetworks';
import {
  encodeP2WPKH,
  getP2WPKHScriptForSigning,
  getP2WPKHWitness,
} from '../../formats/address/p2wpkh';
import { getP2WSHWitness } from '../../formats/address/p2wsh';

export class TransactionSigner {
  private readonly transaction: Transaction;
  private readonly network: BitcoinNetworks;

  constructor(transaction: Transaction, network = BitcoinNetworks.REGTEST) {
    this.transaction = transaction;
    this.network = network;
  }

  private getPublicKey(secret: bigint): Buffer {
    return encodeSEC(getPublicKey(secret));
  }

  private getP2PKHAddress(secret: bigint): string {
    return encodeP2PKH(this.network, this.getPublicKey(secret));
  }

  private getP2WPKHAddress(secret: bigint): string {
    return encodeP2WPKH(this.network, this.getPublicKey(secret));
  }

  public getP2PKInputScriptSignature(
    inputIndex: number,
    secret: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): Buffer {
    const hashToSign = this.transaction.getSignHash(
      inputIndex,
      encodeScript(`${this.getPublicKey(secret).toString('hex')} OP_CHECKSIG`)
        .buffer,
      hashType,
    );

    const signature = Transaction.getSignature(secret, hashToSign, hashType);
    return encodeScript(`${signature.toString('hex')}`).buffer;
  }

  public signP2PKInput(
    inputIndex: number,
    secret: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): this {
    this.transaction.setInputScriptSignature(
      inputIndex,
      this.getP2PKInputScriptSignature(inputIndex, secret, hashType),
    );

    return this;
  }

  public getP2PKHInputScriptSignature(
    inputIndex: number,
    secret: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): Buffer {
    const hashToSign = this.transaction.getSignHash(
      inputIndex,
      getP2PKHScriptPubKey(this.getP2PKHAddress(secret)).buffer,
      hashType,
    );

    const signature = Transaction.getSignature(secret, hashToSign, hashType);

    return getP2PKHScriptSig(signature, this.getPublicKey(secret)).buffer;
  }

  public signP2PKHInput(
    inputIndex: number,
    secret: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): this {
    this.transaction.setInputScriptSignature(
      inputIndex,
      this.getP2PKHInputScriptSignature(inputIndex, secret, hashType),
    );

    return this;
  }

  public getP2MSInputScriptSignature(
    inputIndex: number,
    secrets: bigint[],
    minSignatureAmount: number,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): Buffer {
    if (minSignatureAmount < 1 || minSignatureAmount > secrets.length)
      throw new Error('minSignatureAmount is wrong range');
    if (minSignatureAmount > 16) throw Error('minSignatureAmount is too large');

    const scriptPubKey = encodeScript(
      `OP_${minSignatureAmount} ${secrets.map((secret) => this.getPublicKey(secret)).join(' ')} OP_${secrets.length} OP_CHECKMULTISIG`,
    );

    const signatures = secrets.map((secret) => {
      const hashToSign = this.transaction.getSignHash(
        inputIndex,
        scriptPubKey.buffer,
        hashType,
      );

      return Transaction.getSignature(secret, hashToSign, hashType);
    });

    return encodeScript(
      `OP_0 ${signatures.map((el) => el.toString('hex')).join(' ')}`,
    ).buffer;
  }

  public signP2MSInput(
    inputIndex: number,
    secrets: bigint[],
    minSignatureAmount: number,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): this {
    this.transaction.setInputScriptSignature(
      inputIndex,
      this.getP2MSInputScriptSignature(
        inputIndex,
        secrets,
        minSignatureAmount,
        hashType,
      ),
    );

    return this;
  }

  public getP2WPKHInputWitness(
    inputIndex: number,
    secret: bigint,
    amount: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): Buffer[] {
    const hashToSign = this.transaction.getSighHashWitnessV0(
      inputIndex,
      getP2WPKHScriptForSigning(this.getP2WPKHAddress(secret)).buffer,
      amount,
      hashType,
    );

    const signature = Transaction.getSignature(secret, hashToSign, hashType);

    return getP2WPKHWitness(signature, this.getPublicKey(secret));
  }

  public signP2WPKHInput(
    inputIndex: number,
    secret: bigint,
    amount: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): this {
    this.transaction.setInputWitness(
      inputIndex,
      this.getP2WPKHInputWitness(inputIndex, secret, amount, hashType),
    );

    return this;
  }

  public getP2SHInputScriptSignature(
    redeemScript: Buffer,
    asm: string,
  ): Buffer {
    return encodeScript(`${asm} ${redeemScript.toString('hex')}`.trim()).buffer;
  }

  public signP2SHInput(
    inputIndex: number,
    redeemScript: Buffer,
    asm: string,
  ): this {
    this.transaction.setInputScriptSignature(
      inputIndex,
      this.getP2SHInputScriptSignature(redeemScript, asm),
    );

    return this;
  }

  public signP2SHtoP2WPKHInput(
    inputIndex: number,
    redeemScript: Buffer,
    secret: bigint,
    amount: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ): this {
    this.signP2SHInput(inputIndex, redeemScript, '');
    this.signP2WPKHInput(inputIndex, secret, amount, hashType);

    return this;
  }

  public signP2SHtoP2WSHInput(
    inputIndex: number,
    redeemScriptLegacy: Buffer,
    redeemScriptWitness: Buffer,
    witness: Buffer[],
  ): this {
    this.signP2SHInput(inputIndex, redeemScriptLegacy, '');
    this.signP2WSHInput(inputIndex, redeemScriptWitness, witness);

    return this;
  }

  public getP2WSHInputWitness(
    redeemScript: Buffer,
    witness: Buffer[],
  ): Buffer[] {
    return getP2WSHWitness(witness, redeemScript);
  }

  public signP2WSHInput(
    inputIndex: number,
    redeemScript: Buffer,
    witness: Buffer[],
  ): this {
    this.transaction.setInputWitness(
      inputIndex,
      this.getP2WSHInputWitness(redeemScript, witness),
    );

    return this;
  }

  public getWitnessSignature(
    inputIndex: number,
    secret: bigint,
    prevOutputScript: Buffer,
    amount: bigint,
    hashType = SignatureHashType.SIGHASH_ALL,
  ) {
    return Transaction.getSignature(
      secret,
      this.transaction.getSighHashWitnessV0(
        inputIndex,
        prevOutputScript,
        amount,
        hashType,
      ),
      hashType,
    );
  }

  public getTransaction(): Transaction {
    return this.transaction;
  }

  public serialize(): Buffer {
    return this.transaction.serialize();
  }
}
