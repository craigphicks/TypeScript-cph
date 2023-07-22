// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: true;
const w: readonly[boolean] = [c];

if (c) {
    w;
    // @ts-dev-debugger
    w[0];
}
