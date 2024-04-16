//// [tests/cases/conformance/_caxnc/_caxnc-statements-0002.ts] ////

//// [_caxnc-statements-0002.ts]
declare function f(...args: any[]): void;
function statements0002() {
    let a: number = 0;
    f(a);
    f(a);
    f(a);
    f(a);
}

//// [_caxnc-statements-0002.js]
"use strict";
function statements0002() {
    var a = 0;
    f(a);
    f(a);
    f(a);
    f(a);
}


//// [_caxnc-statements-0002.d.ts]
declare function f(...args: any[]): void;
declare function statements0002(): void;
