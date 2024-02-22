//// [tests/cases/compiler/-test3/-57087-102.ts] ////

//// [-57087-102.ts]
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


/**
 * The following function ft3 should fail.  However, it currently does not
 * The new code only handles cases that fail the in the original code.
 * However, using such long overload chains is not desireable anyway - so we don't need to fix this?
 * Maybe fail on when the number of source overloads is greater than the total number of target overloads?
 */

function ft3(x:1):"3"; // should cause x.g(ft3) to error
function ft3(x:3):"3";
function ft3(x:2):2|"2";
function ft3(x:1|2):1|2; // (4) identical to x1.f
function ft3(x:2|3):"2"|"3"; // (5) identical to x2.f
function ft3(x:1|2|3){
    if (x===1) return x1.f(x);
    if (x===3) return x2.f(x);
    return Math.random() < 0.5 ? x1.f(x) : x2.f(x);
}
x.g(ft3); // should error (but currently doesn't)

/**
 * The following function ft4 should not fail, and it currently does not.
 * However, using such long overload chains is not friendly anyway, so it is irrelevant.
 */

function ft4(x:1):1;
function ft4(x:3):"3";
function ft4(x:2):2|"2";
function ft4(x:1|2):1|2; // (4) identical to x1.f
function ft4(x:2|3):"2"|"3"; // (5) identical to x2.f
function ft4(x:1|2|3){
    if (x===1) return x1.f(x);
    if (x===3) return x2.f(x);
    return Math.random() < 0.5 ? x1.f(x) : x2.f(x);
}
x.g(ft4); // should not error



//// [-57087-102.js]
"use strict";
x1.g(x1.f); // no error
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"
function ft3(x) {
    if (x === 1)
        return x1.f(x);
    if (x === 3)
        return x2.f(x);
    return Math.random() < 0.5 ? x1.f(x) : x2.f(x);
}
x.g(ft3); // should error (but currently doesn't)
function ft4(x) {
    if (x === 1)
        return x1.f(x);
    if (x === 3)
        return x2.f(x);
    return Math.random() < 0.5 ? x1.f(x) : x2.f(x);
}
x.g(ft4); // should not error


//// [-57087-102.d.ts]
interface FMap<T, R> {
    f: (x: T) => R;
    g(f: (x: T) => R): R;
}
declare const x1: FMap<1 | 2, 1 | 2>;
declare const x2: FMap<2 | 3, "2" | "3">;
declare const x: FMap<1 | 2, 1 | 2> | FMap<2 | 3, "2" | "3">;
/**
 * The following function ft3 should fail.  However, it currently does not
 * The new code only handles cases that fail the in the original code.
 * However, using such long overload chains is not desireable anyway - so we don't need to fix this?
 * Maybe fail on when the number of source overloads is greater than the total number of target overloads?
 */
declare function ft3(x: 1): "3";
declare function ft3(x: 3): "3";
declare function ft3(x: 2): 2 | "2";
declare function ft3(x: 1 | 2): 1 | 2;
declare function ft3(x: 2 | 3): "2" | "3";
/**
 * The following function ft4 should not fail, and it currently does not.
 * However, using such long overload chains is not friendly anyway, so it is irrelevant.
 */
declare function ft4(x: 1): 1;
declare function ft4(x: 3): "3";
declare function ft4(x: 2): 2 | "2";
declare function ft4(x: 1 | 2): 1 | 2;
declare function ft4(x: 2 | 3): "2" | "3";
