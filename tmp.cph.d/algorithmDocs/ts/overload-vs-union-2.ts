/* eslint-disable @typescript-eslint/no-unused-expressions */

namespace OverloadVsUnion {

    declare const fOverload: {
        (a: 1, b: 1): 1;
        (a: 1, b: 2): 2;
        (a: 2, b: 1): 3;
    };
    declare const a: 1 | 2;
    declare const b: 1 | 2;
    if (a===2 && b===2) throw Error();
    fOverload(1,1); // no error
    fOverload(1,2); // no error
    fOverload(a,b); // error
    // No overload matches this call.
    // Overload 1 of 3, '(a: 1, b: 1): 1', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '1'.
    //     Type '2' is not assignable to type '1'.
    // Overload 2 of 3, '(a: 1, b: 2): 2', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '1'.
    //     Type '2' is not assignable to type '1'.
    // Overload 3 of 3, '(a: 2, b: 1): 3', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '2'.
    //     Type '1' is not assignable to type '2'.ts(2769)
    let r: 0 | 1 | 2 | 3 | 4  = 0;
    if (a===1 && b===1) r=fOverload(a,b);
    else if (a===1 && b===2) r=fOverload(a,b);
    else if (a===2 && b===1) r=fOverload(a,b);
    r; // 0 | 1 | 2 | 3

    declare const fOverloadCatchAll: {
        (a: 1, b: 1): 1;
        (a: 1, b: 2): 2;
        (a: 2, b: 1): 3;
        (a: 1 | 2, b: 1 | 2): 1 | 2 | 3;
    };
    let r2: 0 | 1 | 2 | 3 | 4 = 0;
    r2 = fOverloadCatchAll(a,b); // no error, type 1|2
    r2; // 1 | 2 | 3 ; as expected



}