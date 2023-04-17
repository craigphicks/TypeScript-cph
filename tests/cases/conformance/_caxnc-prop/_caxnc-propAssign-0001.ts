// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare type T = { p: number };
declare type U = { p: number };
declare const t:T;
declare const tu:T | U;
function propAssign0001_1(): any {
    t.p = 0;
    t;
    t.p;
    return t;
}
function propAssign0001_2(): any {
    tu.p = 0;
    tu;
    tu.p;
    return tu;
}
