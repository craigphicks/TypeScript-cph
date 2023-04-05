//// [_caxnc-rp-003.ts]
declare const b01:0|1;
declare const b02:0|2;
const ca = b01 && b02;
const co = b01 || b02;
const cao = ca && co;
if (ca){
    [b01,b02,ca,co,cao];
}
else {
    [b01,b02,ca,co,cao];
    /**
     * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
     * 0   0   0           0           0
     * 1   0   0           1           0
     * 0   2   0           2           0
     */
}

if (b01 && b02){
    [b01,b02,ca,co,cao];
}
else {
    [b01,b02,ca,co,cao];
}



//// [_caxnc-rp-003.js]
"use strict";
var ca = b01 && b02;
var co = b01 || b02;
var cao = ca && co;
if (ca) {
    [b01, b02, ca, co, cao];
}
else {
    [b01, b02, ca, co, cao];
    /**
     * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
     * 0   0   0           0           0
     * 1   0   0           1           0
     * 0   2   0           2           0
     */
}
if (b01 && b02) {
    [b01, b02, ca, co, cao];
}
else {
    [b01, b02, ca, co, cao];
}


//// [_caxnc-rp-003.d.ts]
declare const b01: 0 | 1;
declare const b02: 0 | 2;
declare const ca: 0 | 2;
declare const co: 0 | 1 | 2;
declare const cao: 0 | 1 | 2;
