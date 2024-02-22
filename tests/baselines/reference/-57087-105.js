//// [tests/cases/compiler/-test3/-57087-105.ts] ////

//// [-57087-105.ts]
type A = { a: string };
type B = { b: 1 };
type C = { c: number };


interface X1 {
    f(x:A):string
    f(x:B):1
    g(f: X1["f"],arg:A|B):()=>ReturnType<X1["f"]>
}
interface X2 {
    f(x:C):number
    f(x:B):"1";
    g(f: X2["f"],arg:C|B):()=>ReturnType<X2["f"]>
}

declare const x1: X1;
declare const arg1: A|B;
x1.g(x1.f,arg1); // should be no error
declare const x2: X2;
declare const arg2: C|B;
x2.g(x2.f,arg2); // should be no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g;
const arg = Math.random() < 0.5 ? arg1 : arg2;



type ArgCastType = (A & C) | (A & B) | (B & C);


function ftw(x:A):string;
function ftw(x:C):number;
function ftw(x:B):1;
function ftw(x: A|B|C) {
    if ("a" in x) return x.a;
    if ("c" in x) return x.c;
    return 1;
}

// The necessity of the argument cast is a separate issue!
x.g(ftw,arg as any as any as ArgCastType); // should not be error

function ftx(x:A):string;
function ftx(x:C):number;
function ftx(x:B):string; // should cause x.g(ft2) to error
function ftx(x: A|B|C) {
    if ("a" in x) return x.a;
    if ("c" in x) return x.c;
    return x.b;
}

// The necessity of the argument cast is a separate issue!
x.g(ftx,arg as any as any as ArgCastType); // should be error

//function fty(x:A):string;  // should cause x.g(ft2) to error
function fty(x:C):number;
function fty(x:B):1;
function fty(x: {a?: string, c?: number, b?: 1|"1"}) {
    if (x.a) return x.a;
    if (x.c) return x.c;
    if (x.b) return x.b;
    throw "unexpected error"
}

// The necessity of the argument cast is a separate issue!
x.g(fty,arg as any as any as ArgCastType); // should be error

function ftz(x:{a?:string}):string;  // should cause x.g(ft2) to error
function ftz(x:C):number;
function ftz(x:B):1;
function ftz(x: {a?: string, c?: number, b?: 1|"1"}) {
    if (x.a) return x.a;
    if (x.c) return x.c;
    if (x.b) return x.b;
    throw "unexpected error"
}

// The necessity of the argument cast is a separate issue!
x.g(ftz,arg as any as any as ArgCastType); // should be error


//// [-57087-105.js]
"use strict";
x1.g(x1.f, arg1); // should be no error
x2.g(x2.f, arg2); // should be no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g;
const arg = Math.random() < 0.5 ? arg1 : arg2;
function ftw(x) {
    if ("a" in x)
        return x.a;
    if ("c" in x)
        return x.c;
    return 1;
}
// The necessity of the argument cast is a separate issue!
x.g(ftw, arg); // should not be error
function ftx(x) {
    if ("a" in x)
        return x.a;
    if ("c" in x)
        return x.c;
    return x.b;
}
// The necessity of the argument cast is a separate issue!
x.g(ftx, arg); // should be error
function fty(x) {
    if (x.a)
        return x.a;
    if (x.c)
        return x.c;
    if (x.b)
        return x.b;
    throw "unexpected error";
}
// The necessity of the argument cast is a separate issue!
x.g(fty, arg); // should be error
function ftz(x) {
    if (x.a)
        return x.a;
    if (x.c)
        return x.c;
    if (x.b)
        return x.b;
    throw "unexpected error";
}
// The necessity of the argument cast is a separate issue!
x.g(ftz, arg); // should be error


//// [-57087-105.d.ts]
type A = {
    a: string;
};
type B = {
    b: 1;
};
type C = {
    c: number;
};
interface X1 {
    f(x: A): string;
    f(x: B): 1;
    g(f: X1["f"], arg: A | B): () => ReturnType<X1["f"]>;
}
interface X2 {
    f(x: C): number;
    f(x: B): "1";
    g(f: X2["f"], arg: C | B): () => ReturnType<X2["f"]>;
}
declare const x1: X1;
declare const arg1: A | B;
declare const x2: X2;
declare const arg2: C | B;
declare const x: X1 | X2;
declare const arg: A | B | C;
type ArgCastType = (A & C) | (A & B) | (B & C);
declare function ftw(x: A): string;
declare function ftw(x: C): number;
declare function ftw(x: B): 1;
declare function ftx(x: A): string;
declare function ftx(x: C): number;
declare function ftx(x: B): string;
declare function fty(x: C): number;
declare function fty(x: B): 1;
declare function ftz(x: {
    a?: string;
}): string;
declare function ftz(x: C): number;
declare function ftz(x: B): 1;
