// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
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
}

if (b01 && b02){
    [b01,b02,ca,co,cao];
}
else {
    [b01,b02,ca,co,cao];
}

