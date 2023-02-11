// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true

declare const b:0|1|2;
const c = b;
if (c){
    b;
    c;
}