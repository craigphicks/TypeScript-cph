/* eslint-disable @typescript-eslint/no-unused-expressions */


type A = & { k: "A", a?: string, c: string };
type B = & { k: "B", b?: string, c: string };

declare function isA(obj: A | B): obj is A;
declare function isB(obj: A | B): obj is B;



declare const x: A | B;
x.a;
x.b;
x.c;



if (isA(x) && isB(x)) {
    // because x.k is never, x is never
    x.a;
    x.b;
    x.c;
}

if (isA(x) || isB(x)) {
    x.a; // error = Property 'a' does not exist on type 'A'|'B'.
    x.b; // error = Property 'b' does not exist on type 'A'|'B'.
    x.c; // ok
}



declare const y: A & B; // y is never
y.a;
y.b;
y.c;


if (isA(y) && isB(y)) {
    y.a; //
    y.b; //
    y.c; //
}

if (isA(y) || isB(y)) {
    y.a; //
    y.b; //
    y.c; //
}
