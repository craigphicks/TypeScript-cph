//// [_caxnc-propAssign-0003.ts]
declare type T3 = { name: "t3", p: number };
declare type U3 = { namae: "u3", p: number };
declare const b: boolean;
function propAssign0003_1(): any {
    const t: T3 = { name: "t3", p: 0 };
    t.p=1;
    return t;
}
function propAssign0003_2(): any {
    const tu: T3 | U3 = b ? { name: "t3", p: 1 } : { namae: "u3", p: 0 };
    tu.p = 2;
    return tu;
}


//// [_caxnc-propAssign-0003.js]
"use strict";
function propAssign0003_1() {
    var t = { name: "t3", p: 0 };
    t.p = 1;
    return t;
}
function propAssign0003_2() {
    var tu = b ? { name: "t3", p: 1 } : { namae: "u3", p: 0 };
    tu.p = 2;
    return tu;
}


//// [_caxnc-propAssign-0003.d.ts]
declare type T3 = {
    name: "t3";
    p: number;
};
declare type U3 = {
    namae: "u3";
    p: number;
};
declare const b: boolean;
declare function propAssign0003_1(): any;
declare function propAssign0003_2(): any;
