// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

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

