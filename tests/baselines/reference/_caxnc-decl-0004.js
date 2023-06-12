//// [_caxnc-decl-0004.ts]
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
let x: number|string = 1;
x;

const y: number|string = 1;
y;


//// [_caxnc-decl-0004.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
var x = 1;
x;
var y = 1;
y;


//// [_caxnc-decl-0004.d.ts]
declare let x: number | string;
declare const y: number | string;
