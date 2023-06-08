//// [_caxnc-arrayLiteralExpression-030.ts]
declare const c: boolean;

let x: readonly[[boolean]] = [[c]];

// @ts-dev-debugger
if (x[0][0]) {
    x[0][0];
}


//// [_caxnc-arrayLiteralExpression-030.js]
"use strict";
var x = [[c]];
// @ts-dev-debugger
if (x[0][0]) {
    x[0][0];
}


//// [_caxnc-arrayLiteralExpression-030.d.ts]
declare const c: boolean;
declare let x: readonly [[boolean]];
