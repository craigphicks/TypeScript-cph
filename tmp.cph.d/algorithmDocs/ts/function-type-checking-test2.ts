
namespace Z2 {
    declare function f(a: 1, b: 1): 1;
    // declare function f(a: 1, b: 2): 2;
    // declare function f(a: 2, b: 1): 3;
    declare function f(a: 2, b: 2): 4;
    declare const a: 1 | 2;
    declare const b: 1 | 2;
    const x = f(a,b); // error, fail, should be no error and have return type 1|2|3|4

    if (a===1 && b===1) {
        const x = f(a,b);
    }

}