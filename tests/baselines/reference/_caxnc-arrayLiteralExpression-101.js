//// [_caxnc-arrayLiteralExpression-101.ts]
let x = [0,1] as const;

if (x[0]===0) {
    x[0];
}


//// [_caxnc-arrayLiteralExpression-101.js]
"use strict";
var x = [0, 1];
if (x[0] === 0) {
    x[0];
}


//// [_caxnc-arrayLiteralExpression-101.d.ts]
declare let x: readonly [0, 1];
