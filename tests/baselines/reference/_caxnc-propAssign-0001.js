//// [_caxnc-propAssign-0001.ts]
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


//// [_caxnc-propAssign-0001.js]
"use strict";
function propAssign0001_2() {
    // @ts-dev-debugger
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
    q: number;
};
declare const tu: T | U;
declare function propAssign0001_2(): any;
