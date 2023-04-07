//// [_caxnc-rhsAssign-0001.ts]
declare const c11: 0 | 1;
{
    let b: 0 | 1;
    const c31 = c11 || (b=c11);
    b;
}


//// [_caxnc-rhsAssign-0001.js]
"use strict";
{
    var b = void 0;
    var c31 = c11 || (b = c11);
    b;
}


//// [_caxnc-rhsAssign-0001.d.ts]
declare const c11: 0 | 1;
