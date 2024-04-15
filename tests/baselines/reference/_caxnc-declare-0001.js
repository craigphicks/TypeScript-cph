//// [tests/cases/conformance/_caxnc/_caxnc-declare-0001.ts] ////

//// [_caxnc-declare-0001.ts]
function declare0001() {
    // flow is not engaged here
    const a: number = 0;
    
    a;
}

//// [_caxnc-declare-0001.js]
"use strict";
function declare0001() {
    // flow is not engaged here
    var a = 0;
    a;
}


//// [_caxnc-declare-0001.d.ts]
declare function declare0001(): void;
