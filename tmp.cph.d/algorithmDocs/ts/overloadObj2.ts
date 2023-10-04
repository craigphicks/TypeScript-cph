/* eslint-disable @typescript-eslint/no-unused-expressions */

namespace Z2 {

    type B1 = & {a: 1, b: 1} | {a: 1, b: 2};
    type B2 = & {a: 1, b: 2} | {a: 2, b: 1};
    type B3 = & {a: 2, b: 1} | {a: 2, b: 2};

    declare function f(x: B1): 1;
    declare function f(x: B2): 2;
    declare function f(x: B3): 3;
    //declare function f({a,b}: {a: 2, b: 2}): 4;
    //declare function f(...args: any[]): never;

    declare const arg1: {a: 1, b: 1} | {a: 1, b: 2};
    declare const arg2: {a: 1, b: 2} | {a: 2, b: 1};
    declare const arg3: {a: 2, b: 1} | {a: 2, b: 2};

    const x1 = f(arg1); // 1, pass
    const x2 = f(arg2); // 2, pass
    const x3 = f(arg3); // 3, pass
    const y1 = f({ a: 1, b: 1 }); // 1, pass
    const y2 = f({ a: 1, b: 2 }); // 1, fail, should be 1|2
    const y3 = f({ a: 2, b: 1 }); // 2, fail, should be 2|3
    const y4 = f({ a: 2, b: 2 }); // 3, pass
    if (arg1.b===1){
        arg1.a; // 1
        arg1.b; // 1
        const y = f(arg1); // 1, pass
    }
    if (arg2.b===1){
        arg2.a; // 2
        arg2.b; // 1
        const y = f(arg2); // 2, fail, should be 2|3
    }
    declare const all: {a: 1, b: 1} | {a: 1, b: 2} | {a: 2, b: 1} | {a: 2, b: 2};
    f(all); // error, fail, should be no error and have return type 1|2|3
    //No overload matches this call.
    //   Overload 1 of 3, '(x: B1): 1', gave the following error.
    //   Argument of type '{ a: 1; b: 1; } | { a: 1; b: 2; } | { a: 2; b: 1; } | { a: 2; b: 2; }' is not assignable to parameter of type 'B1'.
    //     Type '{ a: 2; b: 1; }' is not assignable to type 'B1'.
    //       Type '{ a: 2; b: 1; }' is not assignable to type '{ a: 1; b: 1; }'.
    //         Types of property 'a' are incompatible.
    //           Type '2' is not assignable to type '1'.
    // Overload 2 of 3, '(x: B2): 2', gave the following error.
    //   Argument of type '{ a: 1; b: 1; } | { a: 1; b: 2; } | { a: 2; b: 1; } | { a: 2; b: 2; }' is not assignable to parameter of type 'B2'.
    //     Type '{ a: 1; b: 1; }' is not assignable to type 'B2'.
    //       Type '{ a: 1; b: 1; }' is not assignable to type '{ a: 1; b: 2; }'.


}