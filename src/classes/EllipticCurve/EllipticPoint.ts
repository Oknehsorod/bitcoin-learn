import { FiniteElement } from '../FiniteElement';

export class EllipticPoint {
  private readonly a: FiniteElement;
  private readonly b: FiniteElement;

  private readonly x: FiniteElement | null;
  private readonly y: FiniteElement | null;

  constructor(
    x: FiniteElement | null,
    y: FiniteElement | null,
    a: FiniteElement,
    b: FiniteElement,
  ) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;

    if (this.x === null || this.y === null) return;

    if (
      FiniteElement.notEqual(
        FiniteElement.pow(this.y, 2n),
        FiniteElement.add(
          FiniteElement.add(
            FiniteElement.pow(this.x, 3n),
            FiniteElement.multiply(this.a, this.x),
          ),
          this.b,
        ),
      )
    ) {
      throw new Error(
        `(${this.x.getValue()}, ${this.y.getPrime()}) is not on the curve.`,
      );
    }
  }

  static equal(a: EllipticPoint, b: EllipticPoint): boolean {
    return JSON.stringify(a.getParams()) === JSON.stringify(b.getParams());
  }

  static notEqual(a: EllipticPoint, b: EllipticPoint): boolean {
    return !this.equal(a, b);
  }

  static add(a: EllipticPoint, b: EllipticPoint): EllipticPoint {
    const [aA, aB, aX, aY] = a.getParams();
    const [bA, bB, bX, bY] = b.getParams();

    if (FiniteElement.notEqual(aA, bA) || FiniteElement.notEqual(aB, bB))
      throw new Error(
        `Points ${a.toString()}, ${b.toString()} are not on the same curve.`,
      );

    if (aX === null) return b;
    if (bX === null) return a;

    if (FiniteElement.equal(aX, bX) && FiniteElement.notEqual(aY, bY))
      return new EllipticPoint(null, null, aA, aB);

    if (FiniteElement.notEqual(aX, bX)) {
      const s = FiniteElement.divide(
        FiniteElement.subtract(bY as FiniteElement, aY as FiniteElement),
        FiniteElement.subtract(bX, aX),
      );
      const x3 = FiniteElement.subtract(
        FiniteElement.subtract(FiniteElement.pow(s, 2n), aX),
        bX,
      );
      const y3 = FiniteElement.subtract(
        FiniteElement.multiply(s, FiniteElement.subtract(aX, x3)),
        aY as FiniteElement,
      );
      return new EllipticPoint(x3, y3, aA, aB);
    }

    if (
      FiniteElement.equal(aX, bX) &&
      FiniteElement.equal(aY as FiniteElement, bY as FiniteElement) &&
      aY?.getValue() === 0n
    )
      return new EllipticPoint(null, null, aA, aB);

    const finiteElement3 = new FiniteElement(3n, aA.getPrime());
    const finiteElement2 = new FiniteElement(2n, aA.getPrime());

    const s = FiniteElement.divide(
      FiniteElement.add(
        FiniteElement.multiply(finiteElement3, FiniteElement.pow(aX, 2n)),
        aA,
      ),
      FiniteElement.multiply(finiteElement2, aY as FiniteElement),
    );

    const x3 = FiniteElement.subtract(
      FiniteElement.pow(s, 2n),
      FiniteElement.multiply(finiteElement2, aX),
    );
    const y3 = FiniteElement.subtract(
      FiniteElement.multiply(s, FiniteElement.subtract(aX, x3)),
      aY as FiniteElement,
    );

    return new EllipticPoint(x3, y3, aA, aB);
  }

  static multiply(a: EllipticPoint, times: bigint): EllipticPoint {
    let coef = times;
    let current = a;

    const [aA, aB] = a.getParams();
    let result = new EllipticPoint(null, null, aA, aB);
    while (coef) {
      if (coef & 1n) {
        result = EllipticPoint.add(result, current);
      }
      current = EllipticPoint.add(current, current);
      coef >>= 1n;
    }
    return result;
  }

  public hasEvenY() {
    return this.y?.getValue()! % 2n === 0n;
  }

  public getX() {
    return this.x;
  }

  public getParams(): [
    FiniteElement,
    FiniteElement,
    FiniteElement | null,
    FiniteElement | null,
  ] {
    return [this.a, this.b, this.x, this.y];
  }

  toString() {
    return `EllipticPoint (a: ${this.a.toString()}, b: ${this.b.toString()}, x: ${this.x?.toString()}, y: ${this.y?.toString()})`;
  }
}
