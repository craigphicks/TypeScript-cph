// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true

// flow is not engaged here
declare function isTrue(b:true): true;
declare function isTrue(b:false): false;
const x = true;
isTrue(x);
