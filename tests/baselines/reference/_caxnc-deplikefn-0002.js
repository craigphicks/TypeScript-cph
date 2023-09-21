//// [_caxnc-deplikefn-0002.ts]
interface F {
    "t": number,
    "f": boolean,
  }

// Using overloads the external contract is sound
function dlf(k:"t"): void;
function dlf(k:"f"): void;
// implementation
function dlf(k:keyof F): void {
    if (k==="t"){
        const r1: F[typeof k] = 1; // expect no error
        r1; // expect 1
        const r2: F[typeof k] = true; // expect TS2322: Type 'boolean' is not assignable to type 'number'.
        r2; // expect true
    }
}


//// [_caxnc-deplikefn-0002.js]
"use strict";
// implementation
function dlf(k) {
    if (k === "t") {
        var r1 = 1; // expect no error
        r1; // expect 1
        var r2 = true; // expect TS2322: Type 'boolean' is not assignable to type 'number'.
        r2; // expect true
    }
}


//// [_caxnc-deplikefn-0002.d.ts]
interface F {
    "t": number;
    "f": boolean;
}
declare function dlf(k: "t"): void;
declare function dlf(k: "f"): void;
