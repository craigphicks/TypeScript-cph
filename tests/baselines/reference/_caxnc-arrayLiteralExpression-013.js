//// [_caxnc-arrayLiteralExpression-013.ts]
declare const c: boolean;

const x: readonly[boolean,boolean] = c ? [c,c] as const : [c,c] as const;

if (c) {
    x;
    x[0];
    x[1];
    let x0 = x[0];
    let x1 = x[1];
    x0;
    x1;
}


//// [_caxnc-arrayLiteralExpression-013.js]
"use strict";
var x = c ? [c, c] : [c, c];
if (c) {
    x;
    x[0];
    x[1];
    var x0 = x[0];
    var x1 = x[1];
    x0;
    x1;
}


//// [_caxnc-arrayLiteralExpression-013.d.ts]
declare const c: boolean;
declare const x: readonly [boolean, boolean];
