//// [_caxnc-propAssign-0000.ts]
declare type T = { p: number };
declare const t:T;
function propAssign0000_1() {
    t.p = 0;
    t;
    t.p;
    return t;
}



//// [_caxnc-propAssign-0000.js]
"use strict";
function propAssign0000_1() {
    t.p = 0;
    t;
    t.p;
    return t;
}


//// [_caxnc-propAssign-0000.d.ts]
declare type T = {
    p: number;
};
declare const t: T;
declare function propAssign0000_1(): T;
