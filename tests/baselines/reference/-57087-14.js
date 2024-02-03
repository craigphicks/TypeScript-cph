//// [tests/cases/compiler/-test/-57087-14.ts] ////

//// [-57087-14.ts]
declare const foo: { (x: 1): "1"; (x: 2): "2"; (x: 3): "3"; (x: number): number | "1" | "2" | "3"; }

interface C {
    (x:1):"1";
    (x:2):"20";
    (x:number):number;
    (x:number):"1"|"20"|number;
};
interface B {
    (x:2):"2"
    (x:3):"30"
    (x:number):number;
    (x:2|3|number):"2"|"30"|number;
};
interface A {
    (x:3):"3"
    (x:1):"10"
    (x:number):number;
    (x:1|3|number):"3"|"10"|number;
};


foo satisfies A & B & C;
foo satisfies A & C & B;
foo satisfies B & A & C;
foo satisfies B & C & A;
foo satisfies C & A & B;
foo satisfies C & B & A;

type W = (A & B & C)|(A & C & B)|(B & A & C)|(B & C & A)|(C & A & B)|(C & B & A);

foo satisfies W;

//// [-57087-14.js]
;
;
;
foo;
foo;
foo;
foo;
foo;
foo;
foo;
