//// [_caxnc-arrayLiteralExpression-001.ts]
declare const c: boolean;
const x = c ? [c,c] : [c,c];



//// [_caxnc-arrayLiteralExpression-001.js]
"use strict";
var x = c ? [c, c] : [c, c];


//// [_caxnc-arrayLiteralExpression-001.d.ts]
declare const c: boolean;
declare const x: true[] | false[];
