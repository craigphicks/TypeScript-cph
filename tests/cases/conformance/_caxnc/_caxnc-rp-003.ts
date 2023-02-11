// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true

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
    // (cao!==0) => (ca => (b1===1 && b2===2) => (b1||b2)===1 => co==1 ==> (cao====1)
    // so expect cao: 0|1
}

if (b01 && b02){
    [b01,b02,ca,co,cao];
}
else {
    [b01,b02,ca,co,cao];
}

