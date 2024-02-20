//// [tests/cases/compiler/-test/-57087-05.ts] ////

//// [-57087-05.ts]
type A = { a: string };
type B = { b: 1 | "1" };
type C = { c: number };

interface FMap<T,R> {
    f:(x:T)=>R
    g(f:(x:T)=>R):R;
}
declare const x1: FMap<A|B,string|1>;
x1.g(x1.f); // no error
declare const x2: FMap<B|C,number|"1">;
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"



function ft2(x:A):string;
function ft2(x:C):number;
function ft2(x:B):"1"|1;
function ft2(x: A|B|C):1|"1"|string|number {
    if ("a" in x) return x.a;
    if ("c" in x) return x.c;
    return x.b;
}

x.g(ft2); // error

//// [-57087-05.js]
"use strict";
x1.g(x1.f); // no error
x2.g(x2.f); // no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g; // (method) FMap<T, R>.g(f: ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3")): 1 | 2 | "2" | "3"
function ft2(x) {
    if ("a" in x)
        return x.a;
    if ("c" in x)
        return x.c;
    return x.b;
}
x.g(ft2); // error


//// [-57087-05.d.ts]
type A = {
    a: string;
};
type B = {
    b: 1 | "1";
};
type C = {
    c: number;
};
interface FMap<T, R> {
    f: (x: T) => R;
    g(f: (x: T) => R): R;
}
declare const x1: FMap<A | B, string | 1>;
declare const x2: FMap<B | C, number | "1">;
declare const x: FMap<A | B, string | 1> | FMap<B | C, number | "1">;
declare function ft2(x: A): string;
declare function ft2(x: C): number;
declare function ft2(x: B): "1" | 1;
