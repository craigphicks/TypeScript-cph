//// [_caxnc-and-004.ts]
declare const b1: false;
declare const b2: false;
if (b1 && b2){
    b1;
    b2;
}
else if (b1){
    b1;
    b2;
}
else if (b2){
    b1;
    b2;
}
else {
    b1;
    b2;
}


//// [_caxnc-and-004.js]
"use strict";
if (b1 && b2) {
    b1;
    b2;
}
else if (b1) {
    b1;
    b2;
}
else if (b2) {
    b1;
    b2;
}
else {
    b1;
    b2;
}


//// [_caxnc-and-004.d.ts]
declare const b1: false;
declare const b2: false;
