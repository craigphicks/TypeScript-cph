//// [tests/cases/compiler/-test/-57087-32.ts] ////

//// [-57087-32.ts]
// wihout exactOptionalPropertyTypes set to true, no change

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
f31d satisfies Garg31A & Garg31B; // should satisfy


//// [-57087-32.js]
"use strict";
// wihout exactOptionalPropertyTypes set to true, no change
;
;
f31a; // should satisfy
f31b; // should not satisfy
f31c; // should not satisfy
f31d; // should satisfy


//// [-57087-32.d.ts]
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
