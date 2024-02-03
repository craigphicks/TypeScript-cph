//// [tests/cases/compiler/-test/-57087-11.ts] ////

//// [-57087-11.ts]
declare const f: { (x: 1 | 2): 1 | 2; (x: 3): "2" | "3"; }

type Garg = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f satisfies Garg;

//// [-57087-11.js]
"use strict";
f;


//// [-57087-11.d.ts]
declare const f: {
    (x: 1 | 2): 1 | 2;
    (x: 3): "2" | "3";
};
type Garg = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");
