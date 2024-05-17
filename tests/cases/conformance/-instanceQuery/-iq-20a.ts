// @strict: true
// @target: esnext

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
    interface Ambiguous extends InstanceOfA { extra: number }

}
