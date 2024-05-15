// @strict: true
// @target: esnext

namespace iq0014c1y {
    class EmptyBase {}
    class A { a = 0; }
    declare function extendsEmptyBaseInstance<T extends Object>(x: T): x is ((instanceof EmptyBase) & T);
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a;
    }
    // else {
    //     a;
    // }
}
