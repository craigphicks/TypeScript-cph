/* eslint-disable @typescript-eslint/no-unused-expressions */

namespace Z1 {

    declare function f({a,b}: {a: 1, b: 1}): 1;
    declare function f({a,b}: {a: 1, b: 2}): 2;
    declare function f({a,b}: {a: 2, b: 1}): 3;
    declare function f({a,b}: {a: 2, b: 2}): 4;
    //declare function f(...args: any[]): never;

    declare const arg1: {a: 1, b: 1} | {a: 1, b: 2};
    declare const arg2: {a: 1, b: 2} | {a: 2, b: 1};
    declare const arg3: {a: 2, b: 1} | {a: 2, b: 2};

    const x1 = f(arg1); // error, fail, should be no error and have return type 1|2
    // No overload matches this call.
    //   The last overload gave the following error.
    //   Argument of type '{ a: 1; b: 1; } | { a: 1; b: 2; }' is not assignable to parameter of type '{ a: 2; b: 2; }'.
    //     Type '{ a: 1; b: 1; }' is not assignable to type '{ a: 2; b: 2; }'.
    //       Types of property 'a' are incompatible.
    //         Type '1' is not assignable to type '2'.ts(2769)
    if (arg1.b===1){
        arg1.a; // 1
        arg1.b; // 1
        const y = f(arg1); // no error, pass, return type 1
    }
    if (arg2.b===1){
        arg2.a; // 2
        arg2.b; // 1
        const y = f(arg2); // no error, pass, return type 3
    }

    // if (a===1 && b===1){
    //     const y = f(a,b);
    // }

}