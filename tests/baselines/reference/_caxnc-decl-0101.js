//// [_caxnc-decl-0101.ts]
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
let x = 1;
x;


//// [_caxnc-decl-0101.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
var x = 1;
x;


//// [_caxnc-decl-0101.d.ts]
declare let x: number;
