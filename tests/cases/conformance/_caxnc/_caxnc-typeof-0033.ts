// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const a: number|string;
declare const b: number|boolean;
const xa = typeof a;
const xb = typeof b;
if (xa===xb){
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
