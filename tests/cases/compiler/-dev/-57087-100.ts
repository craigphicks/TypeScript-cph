// @strict

interface A {
    f(x:"a",y:string):1;
    f(x:"b",y:string):1;
    f(x:"c",y:string):1;
    f(x:"d",y:string):1;
    f(x:"e",y:string):1;
    f(x:"f",y:string):1;
};

interface B {
    f(x:"a",y:string):2;
    f(x:"b",y:string):2;
    f(x:"c",y:string):2;
    f(x:"d",y:string):2;
    f(x:"e",y:string):2;
    f(x:"f",y:string):2;
};
(0 as any as A|B) satisfies A&B;

// interface C0 {
//     f(x:"a",y:string):1;
//     f(x:"b",y:string):1;
//     f(x:"c",y:string):1;
//     f(x:"d",y:string):1;
//     f(x:"e",y:string):1;
//     f(x:"f",y:string):1;
// };
// (0 as any as C0) satisfies A&B;

// interface C1 {
//     f(x:"a",y:string):1|2;
//     f(x:"b",y:string):1|2;
//     f(x:"c",y:string):1|2;
//     f(x:"d",y:string):1|2;
//     f(x:"e",y:string):1|2;
//     f(x:"f",y:string):1|2;
// };
// (0 as any as C1) satisfies A&B;

// interface C2 {
//     f(x:"a",y:string):1;
//     f(x:"a",y:string):2;
//     f(x:"b",y:string):1;
//     f(x:"b",y:string):2;
//     f(x:"c",y:string):1;
//     f(x:"c",y:string):2;
//     f(x:"d",y:string):1;
//     f(x:"d",y:string):2;
//     f(x:"e",y:string):1;
//     f(x:"e",y:string):2;
//     f(x:"f",y:string):1;
//     f(x:"f",y:string):2;
// };
// (0 as any as C2) satisfies A&B;


// interface C {
//     a: number;
// }
// interface D {
//     a: string;
// }
// (0 as any as C) satisfies C&D;

// interface E {
//     a: number;
// }
// interface F {
//     b: string;
// }
// (0 as any as E) satisfies E&F;

