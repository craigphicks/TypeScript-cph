// @strict: true
// @target: esnext
// @declaration: true

interface X1 {
    f(x:{a:string}):string
    f(x:{b:1}):1
    g(f: X1["f"],arg:{a:string}|{b:1}):()=>ReturnType<X1["f"]>
}
interface X2 {
    f(x:{c:number}):number
    f(x:{b:1}):"1";
    g(f: X2["f"],arg:{c:number}|{b:"1"}):()=>ReturnType<X2["f"]>
}

declare const x1: X1;
declare const arg1: {a:string}|{b:1};
x1.g(x1.f,arg1); // should be no error
declare const x2: X2;
declare const arg2: {c:number}|{b:"1"};
x2.g(x2.f,arg2); // should be no error
const x = Math.random() < 0.5 ? x1 : x2;
x.g;
const arg = Math.random() < 0.5 ? arg1 : arg2;


type A = { a: string };
type B = { b: 1 | "1" };
type C = { c: number };

//arg satisfies Parameters<typeof x.g>[1];


function ftx(x:A):string;
function ftx(x:C):number;
function ftx(x:B):string; // should cause x.g(ft2) to error
function ftx(x:any):never;
function ftx(x: A|B|C) {
    if ("a" in x) return x.a;
    if ("c" in x) return x.c;
    return x.b;
}


// The necessity of the argument cast is a separate issue!
x.g(ftx,arg as any as any as ({ a: string; } & { c: number; }) | ({ a: string; } & { b: "1"; }) | ({ b: 1; } & { c: number; })); // should be error


function fty(x:A):string;
function fty(x:C):number;
function fty(x:B):string; // should cause x.g(ft2) to error
function fty(x:any):never;
function fty(x: {a?: string, c?: number, b?: 1|"1"}) {
    if (x.a) return x.a;
    if (x.c) return x.c;
    if (x.b) return x.b;
    throw "unexpected error"
}

// The necessity of the argument cast is a separate issue!
x.g(ftx,arg as any as any as ({ a: string; } & { c: number; }) | ({ a: string; } & { b: "1"; }) | ({ b: 1; } & { c: number; })); // should be error

