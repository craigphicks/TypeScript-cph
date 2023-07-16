//// [_caxnc-arrayLiteralExpression-017.ts]
declare const c: true;
const w: readonly[boolean,boolean] = [c,c];
if (c) {
    w;
    w[0];
}


//// [_caxnc-arrayLiteralExpression-017.js]
"use strict";
var w = [c, c];
if (c) {
    w;
    w[0];
}


//// [_caxnc-arrayLiteralExpression-017.d.ts]
declare const c: true;
declare const w: readonly [boolean, boolean];
