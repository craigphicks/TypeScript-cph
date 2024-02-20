// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: true

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


