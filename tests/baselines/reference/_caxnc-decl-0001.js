//// [_caxnc-decl-0001.ts]
// @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
let x = 1;
x;


//// [_caxnc-decl-0001.js]
"use strict";
// @ts-dev-expect-string "count: 0, actualDeclaredTsType: number"
var x = 1;
x;


//// [_caxnc-decl-0001.d.ts]
declare let x: number;
