// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;
const x = c ? [c,c] : [c,c];

if (c) {
    x;
    x[0];
    x[1];
}
else {
    x;
    x[0];
    x[1];
}
