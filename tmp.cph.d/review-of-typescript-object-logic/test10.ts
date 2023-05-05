
type A = & {
    s: 1;
    t: 1 | 2;
    u: 3;
    p: A | 0;
};
type B = & {
    s: 2;
    t: 1 | 2;
    v: 3;
    p: B | 0;
};

type IAB = A & B;
type UAB = A | B;

declare const iab: IAB;
declare const uab: UAB;

const x1 = iab.s; // never (due to interseciton of s=1 and s=2)
const x2 = iab.t; // never (due to interseciton of s=1 and s=2)

const x3 = uab.s; // 1 | 2
const x4 = uab.t; // 1 | 2

const x5 = iab.p; // never (due to interseciton of s=1 and s=2)
const x6 = uab.p; // A | B | 0
const x7 = uab.p.v; // never (due to interseciton of keys)

type C = & {
    s: 1 | 2;
    t: 1 | 2;
    u: 3;
    p: C | undefined;
};
type D = & {
    s: 2 | 3;
    t: 1 | 2;
    v: 3;
    p: D | undefined;
};

type ICD = C & D;
type UCD = C | D;

declare const icd: ICD;
declare const ucd: UCD;

const y1 = icd.s; // 2
const y2 = icd.t; // 1|2

const y3 = ucd.s; // 1 | 2
const y4 = ucd.t; // 1 | 2

const y5 = icd.p!.s; // 2
const y6 = icd.p; // (C & D) | undefined.
const y7 = ucd.p; // C | D | undefined
const y8 = ucd.p!.s; // 1|2|3


type E = & { p: E | {} };
type F = & { p: F | {} };
type EF = E & F;
declare const ef1: EF;
const ef2 = ef1.p; // (0 | E) & (0 | F)

type G = & { p: G | {} };
type H = & { p: H | {} };
type GH = G | H;
declare const gh1: GH;
const gh2 = gh1.p; // 0 | G | H

