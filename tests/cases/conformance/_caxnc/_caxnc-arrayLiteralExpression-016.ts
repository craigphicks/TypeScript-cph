// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const c: true;
const u = [c,c];
const v = [c,c] as const;
const w: readonly[boolean,boolean] = [c,c];
const x: readonly[boolean,boolean] = [c,c] as const;

if (u[0]) {
    u;
    u[0];
    u[1];
}
if (v[0]) {
    v;
    v[0];
    v[1];
}
if (w[0]) {
    w;
    w[0];
    w[1];
}
if (x[0]) {
    x;
    x[0];
    x[1];
}
