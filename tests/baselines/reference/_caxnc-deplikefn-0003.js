//// [_caxnc-deplikefn-0003.ts]
interface F {
    "t": number,
    "f": boolean,
  }

// Using overloads the external contract is sound
function dlf(k:"t"): void;
function dlf(k:"f"): void;
// implementation
function dlf(k:keyof F): void {
    if (k!=="t"){
        const r1: F[typeof k] = 1; // expect TS2322: Type 'number' is not assignable to type 'boolean'.
        r1; // expect 1
        const r2: F[typeof k] = true;
        r2; // expect true
    }
}


//// [_caxnc-deplikefn-0003.js]
"use strict";
// implementation
function dlf(k) {
    if (k !== "t") {
        var r1 = 1; // expect TS2322: Type 'number' is not assignable to type 'boolean'.
        r1; // expect 1
        var r2 = true;
        r2; // expect true
    }
}


//// [_caxnc-deplikefn-0003.d.ts]
interface F {
    "t": number;
    "f": boolean;
}
declare function dlf(k: "t"): void;
declare function dlf(k: "f"): void;
