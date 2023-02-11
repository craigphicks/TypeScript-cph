//// [_cax-typeof-0033.ts]
declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
const xb = typeof b;
if (xa===xb){
    a;
    xa;
    b;
    xb;
}
else {
    a;
    xa;
    b;
    xb;
}


//// [_cax-typeof-0033.js]
"use strict";
var xa = typeof a;
var xb = typeof b;
if (xa === xb) {
    a;
    xa;
    b;
    xb;
}
else {
    a;
    xa;
    b;
    xb;
}


//// [_cax-typeof-0033.d.ts]
declare const a: number | string;
declare const b: number | boolean;
declare const xa: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
declare const xb: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
