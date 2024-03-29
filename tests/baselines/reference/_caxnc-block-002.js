//// [tests/cases/conformance/_caxnc-block/_caxnc-block-002.ts] ////

//// [_caxnc-block-002.ts]
declare const c11: boolean;
let c12 = true
{
    const c21 = c11 || c12;
    c12 = c21;
}
const c31 = c12;
c12 = c31;


//// [_caxnc-block-002.js]
"use strict";
var c12 = true;
{
    var c21 = c11 || c12;
    c12 = c21;
}
var c31 = c12;
c12 = c31;


//// [_caxnc-block-002.d.ts]
declare const c11: boolean;
declare let c12: boolean;
declare const c31: true;
