// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;

let x: readonly[[boolean]] = [[c]];

if (x[0][0]) {
    x[0][0];
}
else x[0][0];

// x[0][0];
