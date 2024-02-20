//// [tests/cases/compiler/-test/-57087-06.ts] ////

//// [-57087-06.ts]
type A = { a: string };
type B = { b: 1 | "1" };
type C = { c: number };
type D = { a?: string, b: 1 | "1", c?: number };


function ft2(x:A):string;
function ft2(x:C):number;
function ft2(x:B):"1"|1;
function ft2(x: A|B|C):1|"1"|string|number {
    if ("a" in x) return x.a;
    if ("c" in x) return x.c;
    return x.b;
}




//// [-57087-06.js]
"use strict";
function ft2(x) {
    if ("a" in x)
        return x.a;
    if ("c" in x)
        return x.c;
    return x.b;
}


//// [-57087-06.d.ts]
type A = {
    a: string;
};
type B = {
    b: 1 | "1";
};
type C = {
    c: number;
};
type D = {
    a?: string;
    b: 1 | "1";
    c?: number;
};
declare function ft2(x: A): string;
declare function ft2(x: C): number;
declare function ft2(x: B): "1" | 1;
