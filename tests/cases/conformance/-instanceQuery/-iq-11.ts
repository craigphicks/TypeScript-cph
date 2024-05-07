// @strict: true
// @target: esnext

namespace iq11a {
    /**
     * In TS, declared constructor type implicitly inherits every
     * other constructor / class which it is not explicitly an ancestor of
     */
    interface A {
        a: number;
    }
    declare interface AConstructor {
        new (): A;
    }
    declare const A: AConstructor;

    interface B {
        b: number;
    }
    declare interface BConstructor {
        new (): B;
    }
    declare const B: BConstructor;

    declare const x: A | B;

    if (x instanceof A) {
        x; // A
        if (x instanceof B) {
            x; // A & B
        }
    }

}

namespace iq11b {

    /**
     * In TS, declared class implicitly inherits every
     * other constructor / class which it is not explicitly an ancestor of
     */

    declare class A {
        a: number;
    }
    declare class B {
        b: number;
    }
    declare const x: A | B;
    if (x instanceof A) {
        x; // A;
        if (x instanceof B) {
            x; // A & B
            x satisfies A;
            x satisfies B;
        }
    }

}

namespace iq11c {


    /**
     * Below, A is an explicit ancestor of B, so A cannot inherit B
     */
    declare class A {
        a: number;
    }
    declare class B extends A {
        b: number;
    }
    declare const x: A | B;
    if (x instanceof A) {
        x; // A ; (B not shown because it is more specific than A)
        if (x instanceof B) {
            x; // B
        }
    }
    if (x instanceof B) {
        x; // B
        if (x instanceof A) {
            x; // B
        }
    }
}

namespace iq11d {

    declare class A {
        a: number;
    }
    declare class B extends A { // treated as though could be `extends A, C`
        b: number;
    }
    declare class C extends A { // treated as though could be `extends A, B`
        c: number;
    }
    declare const x: A | B | C;
    if (x instanceof A) {
        x; // A | B | C
        x satisfies A;
        if (x instanceof B) {
            x; // B
            x satisfies A;
            x satisfies B;
            if (x instanceof C) {
                x; // B & C
                x satisfies A;
                x satisfies B;
                x satisfies C;
            }
        }
    }
}


