//// [_caxnc-rp-007.ts]
declare const b01:0|1;
declare const b02:0|2;
const ca = b01 && b02;
/**
 * b01 b02 ca=b01&&b02
 * 0   0   0          
 * 1   0   0      
 * 0   2   0          
 * 1   2   1          
 */

if (!(b01&&b02)){
    b01;b02;ca;  // expect 0|1, 0|2, 0 
}


//// [_caxnc-rp-007.js]
"use strict";
var ca = b01 && b02;
/**
 * b01 b02 ca=b01&&b02
 * 0   0   0
 * 1   0   0
 * 0   2   0
 * 1   2   1
 */
if (!(b01 && b02)) {
    b01;
    b02;
    ca; // expect 0|1, 0|2, 0 
}


//// [_caxnc-rp-007.d.ts]
declare const b01: 0 | 1;
declare const b02: 0 | 2;
declare const ca: 0 | 2;
