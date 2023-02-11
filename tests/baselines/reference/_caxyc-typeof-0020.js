//// [_caxyc-typeof-0020.ts]
declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
xa;
const xb = typeof b;
xb;
if (xa==="number"){
    a;
    xa;
}
if (typeof a ==="number"){
    a;
    xa;
}


//// [_caxyc-typeof-0020.js]
"use strict";
var xa = typeof a;
xa;
var xb = typeof b;
xb;
if (xa === "number") {
    a;
    xa;
}
if (typeof a === "number") {
    a;
    xa;
}


//// [_caxyc-typeof-0020.d.ts]
declare const a: number | string;
declare const b: number | boolean;
declare const xa: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
declare const xb: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
