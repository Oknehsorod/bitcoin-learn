import { FiniteElement } from '../FiniteElement';
import { EllipticPoint } from './EllipticPoint';

describe('Basic EllipticPoint tests', () => {
  it('should add correctly', () => {
    const prime = 223n;

    const a = new FiniteElement(0n, prime);
    const b = new FiniteElement(7n, prime);

    const input: [[bigint, bigint], [bigint, bigint]][] = [
      [
        [170n, 142n],
        [60n, 139n],
      ],
      [
        [47n, 71n],
        [17n, 56n],
      ],
      [
        [143n, 98n],
        [76n, 66n],
      ],
    ];

    const output: [bigint, bigint][] = [
      [220n, 181n],
      [215n, 68n],
      [47n, 71n],
    ];

    let currentOutputIndex = 0;
    for (const [[aX, aY], [bX, bY]] of input) {
      const aPoint = new EllipticPoint(
        new FiniteElement(aX, prime),
        new FiniteElement(aY, prime),
        a,
        b,
      );
      const bPoint = new EllipticPoint(
        new FiniteElement(bX, prime),
        new FiniteElement(bY, prime),
        a,
        b,
      );

      const [, , outputX, outputY] = EllipticPoint.add(
        aPoint,
        bPoint,
      ).getParams();
      const [correctX, correctY] = output[currentOutputIndex] as [
        bigint,
        bigint,
      ];

      expect(outputX?.getValue()).toBe(correctX);
      expect(outputY?.getValue()).toBe(correctY);

      currentOutputIndex += 1;
    }
  });

  it('should multiply correctly', () => {
    const prime = 223n;

    const a = new FiniteElement(0n, prime);
    const b = new FiniteElement(7n, prime);

    const input: [bigint, [bigint, bigint]][] = [
      [2n, [192n, 105n]],
      [2n, [143n, 98n]],
      [2n, [47n, 71n]],
      [4n, [47n, 71n]],
      [8n, [47n, 71n]],
      [21n, [47n, 71n]],
    ];
    const output: [bigint | undefined, bigint | undefined][] = [
      [49n, 71n],
      [64n, 168n],
      [36n, 111n],
      [194n, 51n],
      [116n, 55n],
      [undefined, undefined],
    ];

    let currentOutputIndex = 0;

    for (const [times, [aX, aY]] of input) {
      const aPoint = new EllipticPoint(
        new FiniteElement(aX, prime),
        new FiniteElement(aY, prime),
        a,
        b,
      );

      const [, , outputX, outputY] = EllipticPoint.multiply(
        aPoint,
        times,
      ).getParams();
      const [correctX, correctY] = output[currentOutputIndex] as [
        bigint | null,
        bigint | null,
      ];

      expect(outputX?.getValue()).toBe(correctX);
      expect(outputY?.getValue()).toBe(correctY);

      currentOutputIndex += 1;
    }
  });
});
