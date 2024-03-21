//// [_caxnc-decl-0104.ts]
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
let x: number|string = 1;
x;


//// [_caxnc-decl-0104.js]
"use strict";
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
var x = 1;
x;


//// [_caxnc-decl-0104.d.ts]
declare let x: number | string;
