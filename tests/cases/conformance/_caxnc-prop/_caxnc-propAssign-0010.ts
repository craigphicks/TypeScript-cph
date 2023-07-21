// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

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
