// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const b: boolean;
declare const c: 0|1;
let x = [c] as const;
let y = [c] as const;

if (x[0]===0) {
    x[0];
    if (y[0]===0) {
        y[0];
        // @ts-dev-debugger
        let z = b ? x : y;
        z[0];
    }
}
