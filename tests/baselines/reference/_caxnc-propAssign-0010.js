//// [_caxnc-propAssign-0010.ts]
declare type T = { u: U, t: T };
declare type U = { u?: U, t: T };
declare const tu1:T | U | undefined;
//declare const tu2:T | U;
function propAssign0001_2(): any {
    if (tu1?.u?.t.u.u){
        // tu1;
        // tu1.u;
        // tu1.u.t;
        // tu1.u.t.u;
        // tu1.u.t.u.u;
        tu1.u.t.u.u = undefined;
        // @ts-dev-debugger
        tu1.u.t.u.u;
        // tu1;
        // tu1.u;
        // tu1.u.t;
        // tu1.u.t.u;
        // tu1.u.t.u.u;
        // return tu1;
    }
}


//// [_caxnc-propAssign-0010.js]
"use strict";
//declare const tu2:T | U;
function propAssign0001_2() {
    var _a;
    if ((_a = tu1 === null || tu1 === void 0 ? void 0 : tu1.u) === null || _a === void 0 ? void 0 : _a.t.u.u) {
        // tu1;
        // tu1.u;
        // tu1.u.t;
        // tu1.u.t.u;
        // tu1.u.t.u.u;
        tu1.u.t.u.u = undefined;
        // @ts-dev-debugger
        tu1.u.t.u.u;
        // tu1;
        // tu1.u;
        // tu1.u.t;
        // tu1.u.t.u;
        // tu1.u.t.u.u;
        // return tu1;
    }
}


//// [_caxnc-propAssign-0010.d.ts]
declare type T = {
    u: U;
    t: T;
};
declare type U = {
    u?: U;
    t: T;
};
declare const tu1: T | U | undefined;
declare function propAssign0001_2(): any;
