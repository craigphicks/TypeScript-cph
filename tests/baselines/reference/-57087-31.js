//// [tests/cases/compiler/-test/-57087-31.ts] ////

//// [-57087-31.ts]
interface Garg31A {
    (): "01";
    (x:1, y:1): "211"
};
interface Garg31B {
    (): "02";
    (x:2, y:2): "222";
    (x:2, y:1): "221"
};

declare const f31a: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; }
f31a satisfies Garg31A & Garg31B; // should satisfy

declare const f31b: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "221" /*should fail match*/; (x: 2, y: 1): "221"; }
f31b satisfies Garg31A & Garg31B; // should not satisfy

declare const f31c: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; (x: 1, y: 2): "221" /*should fail match*/; }
f31c satisfies Garg31A & Garg31B; // should not satisfy

declare const f31d: { (): "01"; (x?: 1, y?: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; }
f31d satisfies Garg31A & Garg31B; // should not satisfy


//// [-57087-31.js]
"use strict";
;
;
f31a; // should satisfy
f31b; // should not satisfy
f31c; // should not satisfy
f31d; // should not satisfy


//// [-57087-31.d.ts]
interface Garg31A {
    (): "01";
    (x: 1, y: 1): "211";
}
interface Garg31B {
    (): "02";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
}
declare const f31a: {
    (): "01";
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
};
declare const f31b: {
    (): "01";
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "221";
    (x: 2, y: 1): "221";
};
declare const f31c: {
    (): "01";
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
    (x: 1, y: 2): "221";
};
declare const f31d: {
    (): "01";
    (x?: 1, y?: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
};
