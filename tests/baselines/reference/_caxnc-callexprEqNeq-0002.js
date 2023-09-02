//// [_caxnc-callexprEqNeq-0002.ts]
declare function f(p:1): 1;
declare function f(p:2): 2;

declare const a: 1|2;
// @ts-ignore-error 2769
if (1===f(a))
{
    a;
}
else {
    a;
}
a;


//// [_caxnc-callexprEqNeq-0002.js]
"use strict";
// @ts-ignore-error 2769
if (1 === f(a)) {
    a;
}
else {
    a;
}
a;


//// [_caxnc-callexprEqNeq-0002.d.ts]
declare function f(p: 1): 1;
declare function f(p: 2): 2;
declare const a: 1 | 2;
