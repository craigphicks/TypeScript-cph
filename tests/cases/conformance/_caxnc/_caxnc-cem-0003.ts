// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const x = true;
const y = isTrue(x);
