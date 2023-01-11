//// [_cax-typeof-0013.ts]
declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
xa;
const xb = typeof b;
xb;

//// [_cax-typeof-0013.js]
"use strict";
var xa = typeof a;
xa;
var xb = typeof b;
xb;


//// [_cax-typeof-0013.d.ts]
declare const a: number | string;
declare const b: number | boolean;
declare const xa: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
declare const xb: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
