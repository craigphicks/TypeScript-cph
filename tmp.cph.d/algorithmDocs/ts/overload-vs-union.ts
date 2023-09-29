
namespace OverloasVsUnion {

    declare const b: boolean;
    const funion = b ? (a: 1)=>1 : (a: 2)=>2;
    funion(1); // error
    // Argument of type 'number' is not assignable to parameter of type 'never'.ts(2345)

    declare const foverload: {
        (a: 1): 1;
        (a: 2): 2;
    };
    foverload(1); // no error



}