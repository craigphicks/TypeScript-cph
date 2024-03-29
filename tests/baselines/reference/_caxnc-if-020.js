//// [tests/cases/conformance/_caxnc/_caxnc-if-020.ts] ////

//// [_caxnc-if-020.ts]
declare let c1: boolean;
declare function fmaybe(): boolean;
if (c1) {
    c1;
    let c2 = fmaybe();
    if (c2) {
        let c3 = fmaybe();
        c2 = c3;
    }
    c1;
    c2
}
c1;

//// [_caxnc-if-020.js]
"use strict";
if (c1) {
    c1;
    var c2 = fmaybe();
    if (c2) {
        var c3 = fmaybe();
        c2 = c3;
    }
    c1;
    c2;
}
c1;


//// [_caxnc-if-020.d.ts]
declare let c1: boolean;
declare function fmaybe(): boolean;
