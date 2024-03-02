//// [tests/cases/compiler/-dev/-incompasig-120.ts] ////

//// [-incompasig-120.ts]
interface Test120<T> {
    (cb:(x:T)=>T):T[];
    <U>(cb:(x:T)=>U):U[];
}


declare const f: Test120<number> | Test120<string>;
const result = f(x => x);




//// [-incompasig-120.js]
"use strict";
var result = f(function (x) { return x; });
