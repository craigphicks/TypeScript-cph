// @strict: true
// @target: esnext

class A { a=2; }
class B extends A { b=3; }
class C { a:number|undefined; b:number|undefined; }

// Basic examples of `instanceof ...` being used where you would use other types
const a0: instanceof A = new A() // Error: This doesn't work because `new A()` is not an instanceQuery type.
// !!! error TS2322: Type 'A' is not assignable to type '(instanceof A & A)'.
// !!! error TS2322:   Object type A has no constructor declared via 'instanceof' therefore is not assignable to constructor typeof A

const a1 = new A() as instanceof A; // This is currently how is must be used to cast `new A()`
// >a1 : (instanceof A & A)
// >   : ^^^^^^^^^^^^^^^^^^


const a2: typeof a1 = a1
// >a2 : (instanceof A & A)
// >   : ^^^^^^^^^^^^^^^^^^

type InstanceOfA = instanceof A
// >InstanceOfA : (instanceof A & A)
// >            : ^^^^^^^^^^^^^^^^^^

interface InstanceOfAConstructor {
    new(): InstanceOfA
}

const InstanceOfA = function(){
    return new A() as InstanceOfA
}

const a3 = new InstanceOfA()

/**
 * Currently NotInstanceOfA does not inherit the "instanceof A" part of InstanceOfA, just the A part.
 * Even `class InheretedInstanceof extends InstanceOfA { also: number }` does not inherit.
 * This should be added.  However the inheritor must have a constructor (implicit or declared).
 * A class always does, an interface might not.
 */
class NotInheritorOfInstanceOfA extends InstanceOfA { also: number }

declare const notinstanceofa = new NotInheritorOfInstanceOfA() // no error, even though no cast.

notinstanceofa satisfies A // no error;

notinstanceofa satisfies InstanceofA // error

// const a3: AlsoInstanceOfA = new A()

// // These accurately represent the runtime, so they probably should be allowed:

// const b1: instanceof A = new B()
// const b2: (instanceof A) & B = new B()
// const b3: (typeof a1) & B = new B()
// const b4: (instanceof A) & (instanceof B) = new B()
// type AB = (instanceof A) & (instanceof B) // could be simplified under-the-hood to `instanceof B` because B extends A

// // And these are not possible, so they should be never:

// type BC = (instanceof B) & (instanceof C)
// type IndirectAC = AlsoInstanceOfA & (instanceof C)

// // Also, presumably mapped types reduce an instanceof type to a plain structural type. E.g.

// type MappedA = { [K in keyof InstanceOfA]: InstanceOfA[K] }
// const a10: MappedA = new A()
// const a11: InstanceOfA = a10 // Error: MappedA matches the structure of InstanceOfA but may not be an instance of A


