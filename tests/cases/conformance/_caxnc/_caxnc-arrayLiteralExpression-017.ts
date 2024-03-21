
// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: true;
const w: readonly[boolean,boolean] = [c,c];
if (c) {
    w;
    w[0];
}
