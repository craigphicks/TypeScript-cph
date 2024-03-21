//// [_caxnc-arrayLiteralExpression-110.ts]
declare const b: boolean;
declare const c: 0|1;
let x = [c] as const;
let y = [c] as const;

if (x[0]===0) {
    x[0];
    if (y[0]===0) {
        y[0];
        // @ts-dev-debugger
        let z = b ? x : y;
        z[0];
    }
}


//// [_caxnc-arrayLiteralExpression-110.js]
"use strict";
var x = [c];
var y = [c];
if (x[0] === 0) {
    x[0];
    if (y[0] === 0) {
        y[0];
        // @ts-dev-debugger
        var z = b ? x : y;
        z[0];
    }
}


//// [_caxnc-arrayLiteralExpression-110.d.ts]
declare const b: boolean;
declare const c: 0 | 1;
declare let x: readonly [0 | 1];
declare let y: readonly [0 | 1];
