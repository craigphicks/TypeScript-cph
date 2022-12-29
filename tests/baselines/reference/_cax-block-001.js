//// [_cax-block-001.ts]
declare const c11: boolean;
{
    const c21 = c11 || c11;
}
const c31 = c11;


//// [_cax-block-001.js]
"use strict";
{
    var c21 = c11 || c11;
}
var c31 = c11;


//// [_cax-block-001.d.ts]
declare const c11: boolean;
declare const c31: boolean;
