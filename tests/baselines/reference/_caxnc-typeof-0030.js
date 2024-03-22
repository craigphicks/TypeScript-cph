//// [tests/cases/conformance/_caxnc/_caxnc-typeof-0030.ts] ////

//// [_caxnc-typeof-0030.ts]
declare const a: number|string;
const xa = typeof a;
// xa;
if (xa==="number"){
    a;
    xa;
}
else {
    a;
    xa;
}
if (typeof a ==="number"){
    a;
    xa;
}
else {
    a;
    xa;
}


//// [_caxnc-typeof-0030.js]
"use strict";
var xa = typeof a;
// xa;
if (xa === "number") {
    a;
    xa;
}
else {
    a;
    xa;
}
if (typeof a === "number") {
    a;
    xa;
}
else {
    a;
    xa;
}


//// [_caxnc-typeof-0030.d.ts]
declare const a: number | string;
declare const xa: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
