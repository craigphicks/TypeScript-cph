//// [_caxnc-callexprEqNeq-0001.ts]
declare function f(x:1): 1;
declare function f(x:2): 2;


declare const x: 1|2;
// @ts-ignore-error 2769
if (f(x)===1)
{
    x;
}
else {
    x;
}
x;


//// [_caxnc-callexprEqNeq-0001.js]
"use strict";
// @ts-ignore-error 2769
if (f(x) === 1) {
    x;
}
else {
    x;
}
x;


//// [_caxnc-callexprEqNeq-0001.d.ts]
declare function f(x: 1): 1;
declare function f(x: 2): 2;
declare const x: 1 | 2;
