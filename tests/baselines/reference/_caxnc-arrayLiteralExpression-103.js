//// [_caxnc-arrayLiteralExpression-103.ts]
declare const c: 0|1;
let x = [c,c] as const;

if (x[0]===0) {
    x[0];
}
else {
    x[0];
}
x[0];


//// [_caxnc-arrayLiteralExpression-103.js]
"use strict";
var x = [c, c];
if (x[0] === 0) {
    x[0];
}
else {
    x[0];
}
x[0];


//// [_caxnc-arrayLiteralExpression-103.d.ts]
declare const c: 0 | 1;
declare let x: readonly [0 | 1, 0 | 1];
