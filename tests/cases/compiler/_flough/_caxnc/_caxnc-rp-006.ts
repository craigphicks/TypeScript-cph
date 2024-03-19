// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

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

if (!ca){
    b01;b02;ca;  // expect 0|1, 0|2, 0 
}
