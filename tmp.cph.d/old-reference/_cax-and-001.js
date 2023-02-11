//// [_cax-and-001.ts]
declare const b1: true | false;
declare const b2: true | false;
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


//// [_cax-and-001.js]
"use strict";
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


//// [_cax-and-001.d.ts]
declare const b1: true | false;
declare const b2: true | false;
