//// [_caxnc-arrayLiteralExpression-013.ts]
declare const c: boolean;

const x:[boolean,boolean] = c ? [c,c] : [c,c];

if (c) {
    x;
    // x[0];
    // x[1];
}


//// [_caxnc-arrayLiteralExpression-013.js]
"use strict";
var x = c ? [c, c] : [c, c];
if (c) {
    x;
    // x[0];
    // x[1];
}


//// [_caxnc-arrayLiteralExpression-013.d.ts]
declare const c: boolean;
declare const x: [boolean, boolean];
