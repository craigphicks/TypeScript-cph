// @strict: true
// @target: esnext
// @declaration: true

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
