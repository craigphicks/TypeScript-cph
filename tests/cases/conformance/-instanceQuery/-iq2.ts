// @strict: true
// @target: esnext

namespace iq00 {
    declare class C<T> {
        c: T;
        constructor(c: T);
    }

    function isInstanceofC<T>(x: C<T>): x is (instanceof C) & C<T> {
        return x instanceof C;
    }

    // const c1 = new C(12);

    // if (isInstanceofC(c1)) {
    //     c1.c;
    // }
}

namespace iq2_2 {
    class A {a: number}
    class B extends A {b: number}
    type TB = { [k in keyof B]: B[k] }; // {a: number, b: number}
    const a = new A();
    if (a instanceof A) {
        a;  // B
    }
    else {
        a;  // A
    }
}
