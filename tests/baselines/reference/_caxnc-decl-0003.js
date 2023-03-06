//// [_caxnc-decl-0003.ts]
declare const b: boolean;
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number[]"
let x = [b?1:1];
x;


//// [_caxnc-decl-0003.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number[]"
var x = [b ? 1 : 1];
x;


//// [_caxnc-decl-0003.d.ts]
declare const b: boolean;
declare let x: number[];
