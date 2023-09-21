//// [_caxnc-deplikefn-0001.ts]
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
        const r1: F[typeof k] = 1; // expect number and no error
    }
}


//// [_caxnc-deplikefn-0001.js]
"use strict";
// implementation
function dlf(k) {
    if (k === "t") {
        var r1 = 1; // expect number and no error
    }
}


//// [_caxnc-deplikefn-0001.d.ts]
interface F {
    "t": number;
    "f": boolean;
}
declare function dlf(k: "t"): void;
declare function dlf(k: "f"): void;
