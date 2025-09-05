import { FiniteElement } from './FiniteElement';

describe('Basic FiniteElement tests', () => {
  it('should add correctly', () => {
    const prime = 57n;

    expect(
      FiniteElement.add(
        new FiniteElement(44n, prime),
        new FiniteElement(33n, prime),
      ).getValue(),
    ).toBe(20n);

    expect(
      FiniteElement.add(
        FiniteElement.add(
          new FiniteElement(17n, prime),
          new FiniteElement(42n, prime),
        ),
        new FiniteElement(49n, prime),
      ).getValue(),
    ).toBe(51n);
  });

  it('should subtract correctly', () => {
    const prime = 57n;

    expect(
      FiniteElement.subtract(
        new FiniteElement(9n, prime),
        new FiniteElement(29n, prime),
      ).getValue(),
    ).toBe(37n);

    expect(
      FiniteElement.subtract(
        FiniteElement.subtract(
          new FiniteElement(52n, prime),
          new FiniteElement(30n, prime),
        ),
        new FiniteElement(38n, prime),
      ).getValue(),
    ).toBe(41n);
  });

  it('should multiply correctly', () => {
    const prime = 97n;

    expect(
      FiniteElement.multiply(
        FiniteElement.multiply(
          new FiniteElement(95n, prime),
          new FiniteElement(45n, prime),
        ),
        new FiniteElement(31n, prime),
      ).getValue(),
    ).toBe(23n);

    expect(
      FiniteElement.multiply(
        FiniteElement.multiply(
          FiniteElement.multiply(
            new FiniteElement(17n, prime),
            new FiniteElement(13n, prime),
          ),
          new FiniteElement(19n, prime),
        ),
        new FiniteElement(44n, prime),
      ).getValue(),
    ).toBe(68n);
  });

  it('should power correctly', () => {
    const prime = 97n;

    expect(
      FiniteElement.multiply(
        FiniteElement.pow(new FiniteElement(12n, prime), 7n),
        FiniteElement.pow(new FiniteElement(77n, prime), 49n),
      ).getValue(),
    ).toBe(63n);
  });

  it('should divide correctly', () => {
    const prime = 31n;

    expect(
      FiniteElement.divide(
        new FiniteElement(3n, prime),
        new FiniteElement(24n, prime),
      ).getValue(),
    ).toBe(4n);
  });

  it('should power with negative numbers correctly', () => {
    const prime = 31n;

    expect(
      FiniteElement.pow(new FiniteElement(17n, prime), -3n).getValue(),
    ).toBe(29n);

    expect(
      FiniteElement.multiply(
        FiniteElement.pow(new FiniteElement(4n, prime), -4n),
        new FiniteElement(11n, prime),
      ).getValue(),
    ).toBe(13n);
  });

  it('should throw error if there are different primes', () => {
    expect(() =>
      FiniteElement.add(new FiniteElement(1n, 3n), new FiniteElement(2n, 4n)),
    ).toThrow('different Fields');
  });
});
