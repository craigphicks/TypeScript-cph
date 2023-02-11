//// [_caxnc-and-021.ts]
declare const b1: true | false;
declare const b2: true | false;
if (b2 && b1){
    
}
else if (b2 || b1){
    if (b1){
        b1;
        b2; // b2 should be false
    }
    else {
        b1;
        b2; // b2 should be true
    }
}
else {
    b1;
    b2;
}


//// [_caxnc-and-021.js]
"use strict";
if (b2 && b1) {
}
else if (b2 || b1) {
    if (b1) {
        b1;
        b2; // b2 should be false
    }
    else {
        b1;
        b2; // b2 should be true
    }
}
else {
    b1;
    b2;
}


//// [_caxnc-and-021.d.ts]
declare const b1: true | false;
declare const b2: true | false;
