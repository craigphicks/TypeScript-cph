// @strict: true

// c.f. 104

declare const foo: { (x: 1): "1"; (x:2): void, (x: 3): "3"; (x: number): number | "1" | "2" | "3"; (x:any): never}

interface C {
    (x:1):"1";
    (x:2):"20";
    (x:number):number | "1" | "20";
};
interface B {
    (x:2):"2"
    (x:3):"30"
    (x:number):number | "2" | "30";
};
interface A {
    (x:3):"3"
    (x:1):"10"
    (x:number):number | "3" | "10";
};


foo satisfies A & B & C;
foo satisfies A & C & B;
foo satisfies B & A & C;
foo satisfies B & C & A;
foo satisfies C & A & B;
foo satisfies C & B & A;

type W = (A & B & C)|(A & C & B)|(B & A & C)|(B & C & A)|(C & A & B)|(C & B & A);

foo satisfies W;