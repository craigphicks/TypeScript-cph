//// [tests/cases/conformance/_caxnc/_caxnc-arrayLiteralExpression-003.ts] ////

//// [_caxnc-arrayLiteralExpression-003.ts]
declare const c: boolean;

const x:[boolean,boolean] = c ? [c,c] : [c,c];

if (c) {
    x;
    x[0];
    x[1];
}
else {
    x;
    x[0];
    x[1];
}


//// [_caxnc-arrayLiteralExpression-003.js]
"use strict";
var x = c ? [c, c] : [c, c];
if (c) {
    x;
    x[0];
    x[1];
}
else {
    x;
    x[0];
    x[1];
}


//// [_caxnc-arrayLiteralExpression-003.d.ts]
declare const c: boolean;
declare const x: [boolean, boolean];
