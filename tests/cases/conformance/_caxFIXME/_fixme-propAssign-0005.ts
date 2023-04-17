// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare type T3 = { name: "t3", p: number };
declare type U3 = { namae: "u3", p: number };
declare const b: boolean;
function propAssign0005_1(): any {
    const t: T3 = { name: "t3", p: 0 };
    t.p=1;
    return t;
}
function propAssign0005_2(): any {
    const tu: T3 | U3 = b ? { name: "t3", p: 1 } : { namae: "u3", p: 0 };
    tu.p = 2;
    return tu;
}
