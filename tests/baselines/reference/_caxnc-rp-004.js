//// [_caxnc-rp-004.ts]
/**
 * b01 b02 ca=b01&&b02 co=b01||b02 cao=ca&&co
 * 0   0   0           0           0
 * 1   0   0           1           0
 * 0   2   0           2           0
 * 1   2   2           1           1
 */
declare const b01:0|1;
declare const b02:0|2;
const ca = b01 && b02; // expect  0|2  
const co = b01 || b02; // expect  0|1|2
const cao = ca && co;  // expect  0|1
if (!ca){
    b01;b02;ca;co;cao; // expect 0|1, 0|2, 0, 0|1|2, 0
}


//// [_caxnc-rp-004.js]
"use strict";
var ca = b01 && b02; // expect  0|2  
var co = b01 || b02; // expect  0|1|2
var cao = ca && co; // expect  0|1
if (!ca) {
    b01;
    b02;
    ca;
    co;
    cao; // expect 0|1, 0|2, 0, 0|1|2, 0
}


//// [_caxnc-rp-004.d.ts]
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
