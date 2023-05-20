// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;

let x: readonly[boolean] = [c];

// @ts-dev-debugger
if (x[0]) {
    x[0];
}
else x[0];

x[0];
