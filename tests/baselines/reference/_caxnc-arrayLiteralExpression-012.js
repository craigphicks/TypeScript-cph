//// [_caxnc-arrayLiteralExpression-012.ts]
declare const c: true;
const w: readonly[boolean] = [c];

if (c) {
    w;
    // @ts-dev-debugger
    w[0];
}


//// [_caxnc-arrayLiteralExpression-012.js]
"use strict";
var w = [c];
if (c) {
    w;
    // @ts-dev-debugger
    w[0];
}


//// [_caxnc-arrayLiteralExpression-012.d.ts]
declare const c: true;
declare const w: readonly [boolean];
