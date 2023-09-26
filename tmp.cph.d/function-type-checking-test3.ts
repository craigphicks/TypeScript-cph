
namespace Z3 {
    declare function f(a: 1, b: 1): 1;
    declare function f(a: 1, b: 2): 2;
    declare function f(a: 2, b: 1): 3;
    declare function f(a: 2, b: 2): 4;
    declare function f(...args: any[]): never;

    declare const a: 1 | 2;
    declare const b: 1 | 2;
    const x = f(a,b); // no error!, however x if never, fail, should be no error and have return type 1|2|3|4
    if ((a===1 || a===2) && (b===1 || b===2)){
        const y = f(a,b);
    }

    if (a===1 && b===1){
        const y = f(a,b);
    }

}