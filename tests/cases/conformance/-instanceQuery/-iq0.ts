
// @strict: true
// @target: esnext


namespace iq0014d {
    class EmptyBase {}
    class A extends EmptyBase { a = 0; }
    class B { a = 0; } // does not extend EmptyBase
    function extendsEmptyBaseInstance<T extends Object>(x: T): x is (instanceof EmptyBase) & T {
        return x instanceof EmptyBase;
    }
    // function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
    //     return x instanceof A;
    // }
    // function extendsBInstance<T extends Object>(x: T): x is (instanceof B) & T {
    //     return x instanceof B;
    // }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a; // (instanceof EmptyBase & (EmptyBase | A))
    }
 }