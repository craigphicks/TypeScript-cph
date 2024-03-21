//// [_caxnc-arrayLiteralExpression-002.ts]
declare const c: boolean;
const x = c ? [c,c] : [c,c];

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


//// [_caxnc-arrayLiteralExpression-002.js]
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


//// [_caxnc-arrayLiteralExpression-002.d.ts]
declare const c: boolean;
declare const x: true[] | false[];
