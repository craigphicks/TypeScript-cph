//// [_caxnc-parens-0000.ts]
declare const a: number|string;
declare const b: number|boolean;
const xa = (typeof a);
const xb = (typeof b);
if (a===b){
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


//// [_caxnc-parens-0000.js]
"use strict";
var xa = (typeof a);
var xb = (typeof b);
if (a === b) {
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


//// [_caxnc-parens-0000.d.ts]
declare const a: number | string;
declare const b: number | boolean;
declare const xa: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
declare const xb: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
