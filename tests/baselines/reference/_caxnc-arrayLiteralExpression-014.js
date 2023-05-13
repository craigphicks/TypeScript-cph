//// [_caxnc-arrayLiteralExpression-014.ts]
declare const c: boolean;

const x: readonly[boolean,boolean] = c ? [c,c] as const : [c,c] as const;

if (x[0]) {
    c;
    x;
    x[0];
    x[1];
}


//// [_caxnc-arrayLiteralExpression-014.js]
"use strict";
var x = c ? [c, c] : [c, c];
if (x[0]) {
    c;
    x;
    x[0];
    x[1];
}


//// [_caxnc-arrayLiteralExpression-014.d.ts]
declare const c: boolean;
declare const x: readonly [boolean, boolean];
