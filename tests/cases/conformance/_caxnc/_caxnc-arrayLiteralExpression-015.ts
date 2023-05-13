// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

type X = readonly [boolean|undefined, boolean|undefined];

declare const b: boolean;
declare const c: boolean;

const x: X = (b==c) ? [b,c] as const : [undefined,undefined] as const;

if (x[0]) {
    b;
    c;
    x;
    x[0];
    x[1];
}
