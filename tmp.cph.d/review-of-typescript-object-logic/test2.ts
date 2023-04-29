type X2 = (number)[];
type Y2 = [number|string];

type I2 = X2 & Y2;
type U2 = X2 | Y2;

declare const i2: I2;
declare const u2: U2;

{
    const ia = i2[0]; // string|number
    const ib = i2[1]; // number
    const ua = u2[0]; // string|number
    const ub = u2[1]; // string|number
}

