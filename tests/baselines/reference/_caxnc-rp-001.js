//// [_caxnc-rp-001.ts]
declare const b:0|1|2;
const c = b;
if (c){
    b;
    c;
}

//// [_caxnc-rp-001.js]
"use strict";
var c = b;
if (c) {
    b;
    c;
}


//// [_caxnc-rp-001.d.ts]
declare const b: 0 | 1 | 2;
declare const c: 0 | 1 | 2;
