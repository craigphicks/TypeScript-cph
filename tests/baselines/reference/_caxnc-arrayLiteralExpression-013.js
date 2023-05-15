//// [_caxnc-arrayLiteralExpression-013.ts]
declare const c: boolean;

const x: readonly[boolean,boolean] = c ? [c,c] as const : [c,c] as const;

if (c) {
    c;
    x;
    x[0];
    x[1];
}
else {
    c;
    x;
    x[0];
    x[1];
}

//// [_caxnc-arrayLiteralExpression-013.js]
"use strict";
var x = c ? [c, c] : [c, c];
if (c) {
    c;
    x;
    x[0];
    x[1];
}
else {
    c;
    x;
    x[0];
    x[1];
}


//// [_caxnc-arrayLiteralExpression-013.d.ts]
declare const c: boolean;
declare const x: readonly [boolean, boolean];
