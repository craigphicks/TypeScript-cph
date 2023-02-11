//// [_caxnc-let-0010.ts]
declare const c1: true | false;
declare const c2: true | false;
let b1 = c1;
let b2 = c2;
if (b1){
    b1;
    b2;
    if (b2){
        b1;
        b2;
    }
    else {
        b1;
        b2;
    }
}
else {
    b1;
    b2;
}


//// [_caxnc-let-0010.js]
"use strict";
var b1 = c1;
var b2 = c2;
if (b1) {
    b1;
    b2;
    if (b2) {
        b1;
        b2;
    }
    else {
        b1;
        b2;
    }
}
else {
    b1;
    b2;
}


//// [_caxnc-let-0010.d.ts]
declare const c1: true | false;
declare const c2: true | false;
declare let b1: boolean;
declare let b2: boolean;
