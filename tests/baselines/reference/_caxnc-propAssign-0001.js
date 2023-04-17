//// [_caxnc-propAssign-0001.ts]
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


//// [_caxnc-propAssign-0001.js]
"use strict";
function propAssign0001_1() {
    t.p = 0;
    t;
    t.p;
    return t;
}
function propAssign0001_2() {
    tu.p = 0;
    tu;
    tu.p;
    return tu;
}


//// [_caxnc-propAssign-0001.d.ts]
declare type T = {
    p: number;
};
declare type U = {
    p: number;
};
declare const t: T;
declare const tu: T | U;
declare function propAssign0001_1(): any;
declare function propAssign0001_2(): any;
