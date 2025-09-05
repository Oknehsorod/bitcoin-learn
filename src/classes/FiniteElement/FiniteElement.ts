import { checkPrimes } from '../../utils/checkPrimes';
import { mod } from '../../utils/mod';

export class FiniteElement {
  private readonly prime: bigint;
  private readonly value: bigint;

  constructor(value: bigint, prime: bigint) {
    if (value >= prime || value < 0)
      throw new Error(`Num ${value} not in field range 0 to ${prime - 1n}`);

    this.value = value;
    this.prime = prime;
  }

  static equal(a: FiniteElement | null, b: FiniteElement | null): boolean {
    return a?.getPrime() === b?.getPrime() && a?.getValue() === b?.getValue();
  }

  static notEqual(a: FiniteElement | null, b: FiniteElement | null): boolean {
    return !this.equal(a, b);
  }

  static add(a: FiniteElement, b: FiniteElement): FiniteElement {
    checkPrimes(a, b, 'add');

    return new FiniteElement(
      mod(a.getValue() + b.getValue(), a.getPrime()),
      a.getPrime(),
    );
  }

  static subtract(a: FiniteElement, b: FiniteElement): FiniteElement {
    checkPrimes(a, b, 'sub');

    return new FiniteElement(
      mod(a.getValue() - b.getValue() + a.getPrime(), a.getPrime()),
      a.getPrime(),
    );
  }

  static multiply(a: FiniteElement, b: FiniteElement): FiniteElement {
    checkPrimes(a, b, 'multiply');

    return new FiniteElement(
      mod(a.getValue() * b.getValue(), a.getPrime()),
      a.getPrime(),
    );
  }

  static pow(a: FiniteElement, exponent: bigint): FiniteElement {
    return new FiniteElement(
      mod(a.getValue() ** mod(exponent, a.getPrime() - 1n), a.getPrime()),
      a.getPrime(),
    );
  }

  static divide(a: FiniteElement, b: FiniteElement): FiniteElement {
    checkPrimes(a, b, 'divide');

    return FiniteElement.multiply(a, FiniteElement.pow(b, -1n));
  }

  public getValue() {
    return this.value;
  }

  public getPrime() {
    return this.prime;
  }

  toString() {
    return `FiniteField (${this.value} ${this.prime})`;
  }
}
