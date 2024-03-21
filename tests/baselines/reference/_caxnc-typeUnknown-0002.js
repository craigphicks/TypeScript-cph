//// [_caxnc-typeUnknown-0002.ts]
declare const x: unknown;
declare const maybe: boolean;
let a = 1;
const b = 2;
let u = x;
if (maybe) {
    u = a;
    u;
}
else {
    u = b;
    u;
}
u;





//// [_caxnc-typeUnknown-0002.js]
"use strict";
var a = 1;
var b = 2;
var u = x;
if (maybe) {
    u = a;
    u;
}
else {
    u = b;
    u;
}
u;


//// [_caxnc-typeUnknown-0002.d.ts]
declare const x: unknown;
declare const maybe: boolean;
declare let a: number;
declare const b = 2;
declare let u: unknown;
