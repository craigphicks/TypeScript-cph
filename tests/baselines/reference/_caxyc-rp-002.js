//// [_caxyc-rp-002.ts]
declare const b:0|1|2;
const c = b;
if (b){
    b;
    c;
}

//// [_caxyc-rp-002.js]
"use strict";
var c = b;
if (b) {
    b;
    c;
}


//// [_caxyc-rp-002.d.ts]
declare const b: 0 | 1 | 2;
declare const c: 0 | 1 | 2;
