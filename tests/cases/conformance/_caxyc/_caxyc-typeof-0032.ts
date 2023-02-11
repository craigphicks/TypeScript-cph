// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true

declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
const xb = typeof b;
if (a===b){
    a;
    xa;
    b;
    xb;
}
else {
    a;
    xa;
    b;
    xb;
}
