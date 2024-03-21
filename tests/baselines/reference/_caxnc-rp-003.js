//// [_caxnc-rp-003.ts]
/**
 * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
 * 0   0   0           0           0
 * 1   0   0           1           0
 * 0   2   0           2           0
 * 1   2   2           1           1
 */


declare const b01:0|1;
declare const b02:0|2;
const ca = b01 && b02;
const co = b01 || b02;
const cao = ca && co;
if (ca){
    [b01,b02,ca,co,cao]; // expect 1, 2, 2, 1, 1
}
else {
    [b01,b02,ca,co,cao]; // expect 0|1, 0|2, 0, 0|1|2, 0
}

if (b01 && b02){
    [b01,b02,ca,co,cao]; // expect 1, 2, 2, 1, 1
}
else {
    [b01,b02,ca,co,cao]; // expect 0|1, 0|2, 2, 0|1|2, 1
}



//// [_caxnc-rp-003.js]
"use strict";
/**
 * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
 * 0   0   0           0           0
 * 1   0   0           1           0
 * 0   2   0           2           0
 * 1   2   2           1           1
 */
var ca = b01 && b02;
var co = b01 || b02;
var cao = ca && co;
if (ca) {
    [b01, b02, ca, co, cao]; // expect 1, 2, 2, 1, 1
}
else {
    [b01, b02, ca, co, cao]; // expect 0|1, 0|2, 0, 0|1|2, 0
}
if (b01 && b02) {
    [b01, b02, ca, co, cao]; // expect 1, 2, 2, 1, 1
}
else {
    [b01, b02, ca, co, cao]; // expect 0|1, 0|2, 2, 0|1|2, 1
}


//// [_caxnc-rp-003.d.ts]
/**
 * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
 * 0   0   0           0           0
 * 1   0   0           1           0
 * 0   2   0           2           0
 * 1   2   2           1           1
 */
declare const b01: 0 | 1;
declare const b02: 0 | 2;
declare const ca: 0 | 2;
declare const co: 0 | 1 | 2;
declare const cao: 0 | 1;
