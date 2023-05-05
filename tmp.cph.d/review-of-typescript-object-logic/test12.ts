/* eslint-disable @typescript-eslint/no-unused-expressions */
// demonstrates that the problem with adding keys in intersection.

type A = & { a?: string, c: string };
type B = & { b?: string, c: string };

declare function isA(obj: A | B): obj is A;
declare function isB(obj: A | B): obj is B;



declare const x: A | B;
x.a;
x.b;
x.c;



if (isA(x) && isB(x)) {
    // by the set-logical rules, x this branch would be representable by intersection(A,B)  = {c: string},
    // but here there is an error..
    x.a; // ok
    x.b; // error = Property 'b' does not exist on type 'A'.
    x.c; // ok
}

if (isA(x) || isB(x)) {
    // by the set-logical rules, x this branch would be representable by
    // union(A,B)  = Set([A,B]), assuming separate identifies maintained, else {a?: string, b?: string, c: string} if merged.
    // but here there is an error..
    x.a; // error = Property 'a' does not exist on type 'A'|'B'.
    x.b; // error = Property 'b' does not exist on type 'A'|'B'.
    x.c; // ok
}



declare const y: A & B;
y.a; // ok, but by set-intersection would be an error
y.b; // ok, but by set-intersection would be an error
y.c;


if (isA(y) && isB(y)) {
    y.a; //
    y.b; //
    y.c; //
}

if (isA(y) || isB(y)) {
    // by the set-logical rules, y this branch would be never.
    y.a; //
    y.b; //
    y.c; //
}
