//// [_caxnc-arrayLiteralExpression-031.ts]
declare const c: boolean;

let x: readonly[[boolean]] = [[c]];

if (x[0][0]) {
    x[0][0];
}
else x[0][0];

// x[0][0];


//// [_caxnc-arrayLiteralExpression-031.js]
"use strict";
var x = [[c]];
if (x[0][0]) {
    x[0][0];
}
else
    x[0][0];
// x[0][0];


//// [_caxnc-arrayLiteralExpression-031.d.ts]
declare const c: boolean;
declare let x: readonly [[boolean]];
