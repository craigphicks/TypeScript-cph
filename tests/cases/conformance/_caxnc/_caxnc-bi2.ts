// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
declare const bar: boolean;
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
rab2;
