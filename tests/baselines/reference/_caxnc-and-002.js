//// [_caxnc-and-002.ts]
declare const b1: true | false;
declare const b2: true | false;
if (b1 && b2){
    b1;
    b2;
}
else {
    b1;
    b2;
    b1 && b2;
}


//// [_caxnc-and-002.js]
"use strict";
if (b1 && b2) {
    b1;
    b2;
}
else {
    b1;
    b2;
    b1 && b2;
}


//// [_caxnc-and-002.d.ts]
declare const b1: true | false;
declare const b2: true | false;
