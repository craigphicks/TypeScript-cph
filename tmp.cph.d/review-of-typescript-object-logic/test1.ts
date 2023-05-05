

type X1 = (number|string)[];
type Y1 = [number];

type I1 = X1 & Y1; // order of operands has no effect
type U1 = X1 | Y1; // order of operands has no effect

declare const i1: I1;
declare const u1: I1;

{
    const ia = i1[0]; // number
    const ib = i1[1]; // number
    const ua = u1[0]; // number
    const ub = u1[1]; // number
}


