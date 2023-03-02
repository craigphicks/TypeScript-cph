//// [_caxnc-decl-0004.ts]
// @ts-dev-expect-string "count: 0, actualDeclaredTsType: string | number"
let x: number|string = 1;
x;


//// [_caxnc-decl-0004.js]
"use strict";
// @ts-dev-expect-string "count: 0, actualDeclaredTsType: string | number"
var x = 1;
x;


//// [_caxnc-decl-0004.d.ts]
declare let x: number | string;
