//// [tests/cases/conformance/_caxnc/_caxnc-and-005.ts] ////

//// [_caxnc-and-005.ts]
declare const c1: true | false;
declare const c2: true | false;
if (c1 && c2){}
else {
    c1 && c2;
} 


//// [_caxnc-and-005.js]
"use strict";
if (c1 && c2) { }
else {
    c1 && c2;
}


//// [_caxnc-and-005.d.ts]
declare const c1: true | false;
declare const c2: true | false;
