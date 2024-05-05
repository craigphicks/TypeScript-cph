//// [tests/cases/conformance/-instanceQuery/instanceQuery-0020.ts] ////

//// [instanceQuery-0020.ts]
namespace iq0020a {

/**
 * An interface type cannot extend an intanceQuery type.
 * That is because of possible amibiguities:
 * 1. The user intended to create an interface type `(instanceof A & A) & {extra: number}`.
 * 2. The user (incorrectly) intended to create an instanceQuery type corresponding to a derived class with type `(instanceof Ambiuous & Ambigous)`
 * The latter (2.) is not possible because:
 * a.  The interface type `Ambiguous` might not have a constructor signature (although we could check for that).
 * b.  The contructor of `Ambiguous` (if it exists) might not call the super constructor for the intended inherited constructor `A`.
 * For purpose (1.), `type` can be used instead, so to avoid the ambiguity an compile error is generated.
 *
 * Incidentally, the following syntax could be considered to allow the functionality of (2.):
 * ```
 * interface Ambiguous extends InstanceOfA {
 *     new(): AlsoInstanceOfA inherits A;
 * }
 * ```
 * where the return type qualifies `inherits A` indicates that the constructor of `Ambiguous` calls the constructor of `A`.
 */
class A {};
type InstanceOfA = instanceof A;
interface Ambiguous extends InstanceOfA { extra: number } // should be error

}

namespace iq0020b {

    class A extends Object {
        constructor() {
            super();
        }
    }
    const InstanceofA = A as any as { new(): instanceof A };

    const instanceOfAInstance = new InstanceofA();
    instanceOfAInstance satisfies instanceof Object;


}


namespace iq0020c {

    /**
     * The above code in iq0020b has no errors.
     * But it would be convient to be able to write:
     * ```
     * class InstanceofA extends InstanceObject {...}
     * ```
     * to avoid writing
     * ```
     * const InstanceofA = A as any as { new(): instanceof A };
     * ```
     * which would be required for every class in a hierarchy of classes with instanceQuery types.
     *
     * In the following code only the `InstanceofObject` requires a cast to an instanceQuery type.
     * All dervied class inherit without the need for a cast. (This required some additional code changes to the compiler)
     */


const InstanceofObject = Object as any as { new(): instanceof Object };

const instanceofInstanceofObject = new InstanceofObject();

class InstanceofA extends InstanceofObject {
    constructor() {
        super();
    }
}
const instanceOfAInstance = new InstanceofA();
instanceOfAInstance satisfies instanceof Object;

}


//// [instanceQuery-0020.js]
"use strict";
var iq0020a;
(function (iq0020a) {
    /**
     * An interface type cannot extend an intanceQuery type.
     * That is because of possible amibiguities:
     * 1. The user intended to create an interface type `(instanceof A & A) & {extra: number}`.
     * 2. The user (incorrectly) intended to create an instanceQuery type corresponding to a derived class with type `(instanceof Ambiuous & Ambigous)`
     * The latter (2.) is not possible because:
     * a.  The interface type `Ambiguous` might not have a constructor signature (although we could check for that).
     * b.  The contructor of `Ambiguous` (if it exists) might not call the super constructor for the intended inherited constructor `A`.
     * For purpose (1.), `type` can be used instead, so to avoid the ambiguity an compile error is generated.
     *
     * Incidentally, the following syntax could be considered to allow the functionality of (2.):
     * ```
     * interface Ambiguous extends InstanceOfA {
     *     new(): AlsoInstanceOfA inherits A;
     * }
     * ```
     * where the return type qualifies `inherits A` indicates that the constructor of `Ambiguous` calls the constructor of `A`.
     */
    class A {
    }
    ;
})(iq0020a || (iq0020a = {}));
var iq0020b;
(function (iq0020b) {
    class A extends Object {
        constructor() {
            super();
        }
    }
    const InstanceofA = A;
    const instanceOfAInstance = new InstanceofA();
    instanceOfAInstance;
})(iq0020b || (iq0020b = {}));
var iq0020c;
(function (iq0020c) {
    /**
     * The above code in iq0020b has no errors.
     * But it would be convient to be able to write:
     * ```
     * class InstanceofA extends InstanceObject {...}
     * ```
     * to avoid writing
     * ```
     * const InstanceofA = A as any as { new(): instanceof A };
     * ```
     * which would be required for every class in a hierarchy of classes with instanceQuery types.
     *
     * In the following code only the `InstanceofObject` requires a cast to an instanceQuery type.
     * All dervied class inherit without the need for a cast. (This required some additional code changes to the compiler)
     */
    const InstanceofObject = Object;
    const instanceofInstanceofObject = new InstanceofObject();
    class InstanceofA extends InstanceofObject {
        constructor() {
            super();
        }
    }
    const instanceOfAInstance = new InstanceofA();
    instanceOfAInstance;
})(iq0020c || (iq0020c = {}));
