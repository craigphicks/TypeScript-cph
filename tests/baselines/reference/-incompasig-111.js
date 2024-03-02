//// [tests/cases/compiler/-dev/-incompasig-111.ts] ////

//// [-incompasig-111.ts]
interface Test111<T> {
    f(cb:(a:T, x:T)=>T):T[];
    f<U>(cb:(a:U, x:T)=>U,init:U):U[];
}

declare const arr: Test111<number> | Test111<bigint>;
const result = arr.f((a:bigint, x) => a * BigInt(x), 1n);




//// [-incompasig-111.js]
"use strict";
const result = arr.f((a, x) => a * BigInt(x), 1n);
