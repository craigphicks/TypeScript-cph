//// [_caxnc-eqneqLRNindep-0000.ts]
let x: string | number= 1;
let y: string | number= 1;
if (x===(y="one")){
    x;y;
}
x;y;

//// [_caxnc-eqneqLRNindep-0000.js]
"use strict";
var x = 1;
var y = 1;
if (x === (y = "one")) {
    x;
    y;
}
x;
y;


//// [_caxnc-eqneqLRNindep-0000.d.ts]
declare let x: string | number;
declare let y: string | number;
