// @strict: true
// @target: esnext

namespace iq0014e0 {
    class EmptyBase {}
    class A extends EmptyBase { a = 0; }
    class B { a = 0; } // does not extend EmptyBase
    function extendsEmptyBaseInstance<T extends Object>(x: T): x is (instanceof EmptyBase) & T {
        return x instanceof EmptyBase;
    }
    // function extendsBInstance<T extends Object>(x: T): x is (instanceof B) & T {
    //     return x instanceof B;
    // }
    // declare const a1: A;
    // if (extendsEmptyBaseInstance(a1)) {
    //     a1; // (instanceof A & A)
    //     // if (extendsBInstance(a1)) {
    //     //     a1; // never
    //     // }
    // }
    // declare const a2: EmptyBase;
    // if (extendsEmptyBaseInstance(a2)) {
    //     a2; // (instanceof EmptyBase & EmptyBase)
    //     if (extendsBInstance(a2)) {
    //         a2; // never
    //     }
    // }
}

namespace iq0014e1 {
    class EmptyBase {}
    class A extends EmptyBase { a = 0; }
    class B { a = 0; } // does not extend EmptyBase
    function extendsEmptyBaseInstance<T>(x: T): x is (instanceof EmptyBase) & T {
        return x instanceof EmptyBase;
    }
    // function extendsBInstance<T extends Object>(x: T): x is (instanceof B) & T {
    //     return x instanceof B;
    // }
    // declare const a1: A;
    // if (extendsEmptyBaseInstance(a1)) {
    //     a1; // (instanceof A & A)
    //     // if (extendsBInstance(a1)) {
    //     //     a1; // never
    //     // }
    // }
    // declare const a2: EmptyBase;
    // if (extendsEmptyBaseInstance(a2)) {
    //     a2; // (instanceof EmptyBase & EmptyBase)
    //     if (extendsBInstance(a2)) {
    //         a2; // never
    //     }
    // }
}


// namespace iq0014e2 {
//     class EmptyBase {}
//     class A extends EmptyBase { a = 0; }
//     class B { a = 0; } // does not extend EmptyBase
//     function extendsEmptyBaseInstance<T extends Object>(x: T): x is (instanceof EmptyBase) & T {
//         return x instanceof EmptyBase;
//     }
//     function extendsBInstance<T extends Object>(x: T): x is (instanceof B) & T {
//         return x instanceof B;
//     }
//     declare const a: A | EmptyBase | {};
//     if (extendsEmptyBaseInstance(a)) {
//         a; // (instanceof EmptyBase & EmptyBase) | (instanceof A & A)
//         if (extendsBInstance(a)) {
//             a; // never
//         }
//     }
// }
