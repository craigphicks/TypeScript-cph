/* eslint-disable @typescript-eslint/no-unused-expressions */

namespace OverloasVsUnion {

    declare const b: boolean;
    const funion = b ? (a: 1)=>1 : (a: 2)=>2;
    funion(1); // error
    // Argument of type 'number' is not assignable to parameter of type 'never'.ts(2345)

    declare const foverload: {
        (a: 1): 1;
        (a: 2): 2;
    };
    declare const a: 1 | 2;
    foverload(1); // no error

    foverload(a); // error!
    // No overload matches this call.
    // Overload 1 of 2, '(a: 1): 1', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '1'.
    //     Type '2' is not assignable to type '1'.
    // Overload 2 of 2, '(a: 2): 2', gave the following error.
    //     Argument of type '1 | 2' is not assignable to parameter of type '2'.
    //     Type '1' is not assignable to type '2'.ts(2769)

    let r: 1 | 2 | 3; // ReturnType<floverload> evaluates to 2, which is a bug, so don't use it.
    if (a===1) r=foverload(a);
    else r=foverload(a);
    r; // 1|2

    declare const foverloadCatchAll: {
        (a: 1): 1;
        (a: 2): 2;
        (a: 1 | 2): 1 | 2;
    };
    let r2: 
    foverloadCatchAll(a); // no error, type 1|2



}