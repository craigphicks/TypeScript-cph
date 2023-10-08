/* eslint-disable @typescript-eslint/no-unused-expressions */


namespace X1 {

type A = & {x: A, c: string};
type B = & {x: B, c: number};

type ReadonlyA = Readonly<A>;
type ReadonlyB = Readonly<B>;


declare function isReadonlyA(x: any): x is ReadonlyA;
declare function isReadonlyB(x: any): x is ReadonlyA;

function f(a: ReadonlyA): 1;
function f(b: ReadonlyB): 2;
// function f(...args: readonly [A | B]): any {
//     args[0] = {}; // is correctly an error:
//     // Cannot assign to '0' because it is a read-only property.ts(2540)
//     if (isA(args[0])){
//         args[0].a = 1; // not an error! ooops
//     }
//     return;
// }
function f(...args: Readonly<[ReadonlyA | ReadonlyB]>): any {
    args[0] = {} as A; // error (pass)
    // Cannot assign to '0' because it is a read-only property.ts(2540)
    args[0].c = 1; // error (pass)
    // cannot assign to c because it is a read-only property.ts(2540)
    if (isReadonlyA(args[0])){
        args[0].c = ""; // error (pass)
    }
    return;
}


interface F {
    "t": number,
    "f": boolean,
}
function dlf1<T extends keyof F>(k: T): F[T] {
    k;
    if (k==="t"){
        const x = dlf1(k);
        // suppose flow analysis successfully determines that return type should be typeof dlft1("t")
        return 1; // no error, pass
        // return true; // no error, fail BUG
    }
    else {
        // suppose flow analysis successfully determines that return type should be typeof dlft1("f")
        return true; // no error, pass
        // return 1; // no error, fail BUG
    }
}
type Ft = typeof dlf1<"t">; // number
// function dlf1<T extends keyof F>(...args: readonly[T]): F[T] {
//     const k = args[0];
//     if (k==="t"){
//         // suppose flow analysis successfully determines that return type should be typeof dlft1("t")
//         return 1; // no error, pass
//         // return true; // no error, fail BUG
//     }
//     else {
//         // suppose flow analysis successfully determines that return type should be typeof dlft1("f")
//         return true; // no error, pass
//         // return 1; // no error, fail BUG
//     }
// }
const xt = dlf1("t"); // number



}
