//// [tests/cases/conformance/_caxnc-eqneq/_caxnc-eqneqLRNindep-0002.ts] ////

//// [_caxnc-eqneqLRNindep-0002.ts]
let x: string | number | bigint = 1;
let y: string | number | bigint = 1;
x;
y;
// Oddly, this is not an error.
if (x===(y="one")){
    x;y;
}
else {
    x;y;
}

//// [_caxnc-eqneqLRNindep-0002.js]
"use strict";
var x = 1;
var y = 1;
x;
y;
// Oddly, this is not an error.
if (x === (y = "one")) {
    x;
    y;
}
else {
    x;
    y;
}


//// [_caxnc-eqneqLRNindep-0002.d.ts]
declare let x: string | number | bigint;
declare let y: string | number | bigint;
