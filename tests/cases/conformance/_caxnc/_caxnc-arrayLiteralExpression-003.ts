// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true 
// @declaration: true

declare const c: boolean;

const x:[boolean,boolean] = c ? [c,c] : [c,c];

if (c) x;
else x;
