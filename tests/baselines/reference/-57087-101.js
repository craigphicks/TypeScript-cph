//// [tests/cases/compiler/-test3/-57087-101.ts] ////

//// [-57087-101.ts]
interface FMap<T,R> {
    f:(x:T)=>R
    g(f:(x:T)=>R):R;
}
declare const x1: FMap<1|2,1|2>;
x1.g(x1.f); // no error
declare const x2: FMap<2|3,"2"|"3">;
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"

/*
 * Exact expansion of x.g, with the intersection of the two function types expanded.
 * Catch-all with "never" return is not required to pass the test.
 */
function ft0(x:1|2):1|2;
function ft0(x:2|3):"2"|"3";
function ft0(x:1|2|3){
    if (x!==3) return x1.f(x);
    else return x2.f(x);
}
x.g(ft0); // should not be error

/*
 * Condtion for passing are:
 * (a1) Every source overload is matches at least one target overload
 * (a2) Every target overload is matched by at least one souce overload
 * where "matching" is defined as
 * (b1) the target result is void OR the target result and source result overlap // should be source result subset of target result ?
 * (b2) the target and source parameters match identically up to the number of required source parameters.
 * This test case fails because: source (x:1) is not identical to target (x:1|2) or (x:2|3)
 */

function ft1(x:1):1;
function ft1(x:2):2;
function ft1(x:3):"3";
function ft1(x:1|2|3) {
    switch (x) {
        case 1: return 1;
        case 2: return 2;
        case 3: return "3";
    }
    throw "unexpected error"
}
x.g(ft1); // should be error



//// [-57087-101.js]
"use strict";
x1.g(x1.f); // no error
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"
function ft0(x) {
    if (x !== 3)
        return x1.f(x);
    else
        return x2.f(x);
}
x.g(ft0); // should not be error
function ft1(x) {
    switch (x) {
        case 1: return 1;
        case 2: return 2;
        case 3: return "3";
    }
    throw "unexpected error";
}
x.g(ft1); // should be error


//// [-57087-101.d.ts]
interface FMap<T, R> {
    f: (x: T) => R;
    g(f: (x: T) => R): R;
}
declare const x1: FMap<1 | 2, 1 | 2>;
declare const x2: FMap<2 | 3, "2" | "3">;
declare const x: FMap<1 | 2, 1 | 2> | FMap<2 | 3, "2" | "3">;
declare function ft0(x: 1 | 2): 1 | 2;
declare function ft0(x: 2 | 3): "2" | "3";
declare function ft1(x: 1): 1;
declare function ft1(x: 2): 2;
declare function ft1(x: 3): "3";
