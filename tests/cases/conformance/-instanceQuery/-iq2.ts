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

declare interface A { a: number; }
declare interface AConstructor { new(): A; }
declare const A: AConstructor;

declare interface B extends A { b: number; }
declare interface BConstructor { new(): B; }
declare const B: BConstructor;

const a = new A() as instanceof A;
const b = new B() as instanceof B;

a satisfies instanceof A;
/**
 * The following is an error because it is not known if BConstructor calls A's constructor.
 */
b satisfies instanceof A;



/**
 * Maybe a syntax like
 * ```
 * declare interface BConstructor { new(): B inherits A; }
 * ```
 * could be allowed to specify that B's constructor calls A's constructor.
 */

/**
 * Work around:
 */

function isInstanceofA(x: A): x is instanceof A {
    return x instanceof A;
}

if (isInstanceofA(b)) {
    b satisfies instanceof A; // OK
}


}
