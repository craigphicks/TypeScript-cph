//// [_caxnc-arrayLiteralExpression-020.ts]
declare const c: boolean;

let x: readonly[boolean] = [c];

if (x[0]) {
    x[0];
}


//// [_caxnc-arrayLiteralExpression-020.js]
"use strict";
var x = [c];
if (x[0]) {
    x[0];
}


//// [_caxnc-arrayLiteralExpression-020.d.ts]
declare const c: boolean;
declare let x: readonly [boolean];
