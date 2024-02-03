//// [tests/cases/compiler/-test/-57087-21.ts] ////

//// [-57087-21.ts]
// test f domain does not support Garg domain (3 omitted from f domain) - cannot detect during satisfies but can detect during call to f1

declare const f1: { (x: 1 | 2): 1 | 2; (x: 2): "2" | "3";}

type Garg1 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f1 satisfies Garg1; // no error expected

f1(3); // error exptected - No overload matches this call. (ts2769)
// ~


//// [-57087-21.js]
"use strict";
// test f domain does not support Garg domain (3 omitted from f domain) - cannot detect during satisfies but can detect during call to f1
f1; // no error expected
f1(3); // error exptected - No overload matches this call. (ts2769)
// ~


//// [-57087-21.d.ts]
declare const f1: {
    (x: 1 | 2): 1 | 2;
    (x: 2): "2" | "3";
};
type Garg1 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");
