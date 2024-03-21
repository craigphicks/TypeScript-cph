//// [_caxnc-arrayLiteralExpression-015.ts]
declare const c: true;
const u = [c,c];
const v = [c,c] as const;
const w: readonly[boolean,boolean] = [c,c];
const x: readonly[boolean,boolean] = [c,c] as const;

if (c) {
    u;v;w;x;

    u[0];
    v[0];
    w[0];
    x[0];
}


//// [_caxnc-arrayLiteralExpression-015.js]
"use strict";
var u = [c, c];
var v = [c, c];
var w = [c, c];
var x = [c, c];
if (c) {
    u;
    v;
    w;
    x;
    u[0];
    v[0];
    w[0];
    x[0];
}


//// [_caxnc-arrayLiteralExpression-015.d.ts]
declare const c: true;
declare const u: true[];
declare const v: readonly [true, true];
declare const w: readonly [boolean, boolean];
declare const x: readonly [boolean, boolean];
