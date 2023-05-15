// @floughEnable: true
// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: boolean;

const x: readonly[boolean,boolean] = c ? [c,c] as const : [c,c] as const;

if (c) {
    c;
    x;
    x[0];
    x[1];
}
else {
    c;
    x;
    x[0];
    x[1];
}