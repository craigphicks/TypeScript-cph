//// [_caxnc-arrayLiteralExpression-102.ts]
let x = [0,1] as const;

if (x[0]===0) {
    x[0];
}
else {
    x[0];
}
x[0];


//// [_caxnc-arrayLiteralExpression-102.js]
"use strict";
var x = [0, 1];
if (x[0] === 0) {
    x[0];
}
else {
    x[0];
}
x[0];


//// [_caxnc-arrayLiteralExpression-102.d.ts]
declare let x: readonly [0, 1];
