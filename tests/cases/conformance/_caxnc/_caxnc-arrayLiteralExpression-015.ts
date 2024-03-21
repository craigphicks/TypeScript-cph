// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: true;
const u = [c,c];
const v = [c,c] as const;
const w: readonly[boolean,boolean] = [c,c];
const x: readonly[boolean,boolean] = [c,c] as const;

if (c) {
    u;v;w;x;

    u[0];
    v[0];
    w[0];
    x[0];
}
