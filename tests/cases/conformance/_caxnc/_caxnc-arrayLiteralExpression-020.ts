// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;

// @ts-dev-debugger
let x: readonly[boolean] = [c];

if (x[0]) {
    x[0];
}
