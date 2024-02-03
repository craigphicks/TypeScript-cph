//// [tests/cases/compiler/-test/-57087-21.ts] ////

//// [-57087-21.ts]
// test f domain does not support Garg domain (3 omitted from f domain) - should not satisfy

declare const f1: { (x: 1 | 2): 1 | 2; (x: 2): "2" | "3";}

type Garg1 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f1 satisfies Garg1; // should not satisfy


//// [-57087-21.js]
"use strict";
// test f domain does not support Garg domain (3 omitted from f domain) - should not satisfy
f1; // should not satisfy


//// [-57087-21.d.ts]
declare const f1: {
    (x: 1 | 2): 1 | 2;
    (x: 2): "2" | "3";
};
type Garg1 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");
