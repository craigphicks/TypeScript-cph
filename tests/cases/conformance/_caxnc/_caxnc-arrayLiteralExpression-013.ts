// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;

const x: readonly[boolean,boolean] = c ? [c,c] as const : [c,c] as const;

if (c) {
    x;
    x[0];
    x[1];
    let x0 = x[0];
    let x1 = x[1];
    x0;
    x1;
}
