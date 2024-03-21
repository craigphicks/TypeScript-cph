// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare type T = { p: number };
declare type U = { p: number, q:number };
declare const tu:T | U;
function propAssign0001_2(): any {
    // @ts-dev-debugger
    tu.p = 0;
    tu;
    tu.p;
    return tu;
}
