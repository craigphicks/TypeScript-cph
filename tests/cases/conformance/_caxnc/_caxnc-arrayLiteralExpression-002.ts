// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true 
// @declaration: true

declare const c: boolean;
const x = c ? [c,c] : [c,c];

if (c) x;
else x;
