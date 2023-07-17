// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare type T = { p: number };
declare const t:T;
function propAssign0001_1(): any {
    t.p = 0;
    t;
    t.p;
    return t;
}
