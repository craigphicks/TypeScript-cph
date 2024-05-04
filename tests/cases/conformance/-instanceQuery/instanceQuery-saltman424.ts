// @strict: true
// @target: esnext

class A { a=2; }
class B extends A { b=3; }
class C { a:number|undefined; b:number|undefined; }

// Basic examples of `instanceof ...` being used where you would use other types
const a1x: instanceof A = new A() // Error: This doesn't work because `new A()` is not an instanceQuery type.
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

interface AlsoInstanceOfA extends InstanceOfA {}
new A() as InstanceOfA satisfies AlsoInstanceOfA; // OK

interface NotInstanceOfA extends InstanceOfA { extra: number}
function createNotInstanceOfA() {
    const a = new A() as any as NotInstanceOfA;
    a.extra = 1;
    return a;
}
createNotInstanceOfA() satisfies AlsoInstanceOfA; // OK (extra property is OK)
new A() as instanceof A satisifies NotInstanceOfA; // Error (missing property)`





/**
 * In the current trial implementation (so far)
 * `interface AlsoInstanceOfA extends InstanceOfA {}`
 * is equivalent to `interface AlsoInstanceOfA extends A {}`,
 * i.e., the `instanceof A` part is not inherited.
 * There are two reasons for this:
 * 1. The `instanceof` must correspond to JS constructor inheritance, and just declaring an
 *    interface doesn't guarantee that correspondance.
 * 2. Even in cases where JS correspondance to class inherticance can be proven, and inheriting `instanceof`
 *    would be possible and prefereable, this trial version hasn't implemented it yet.
 */

const a3: AlsoInstanceOfA = new A();  // This works but it is only doing structural type checking, not instanceof checking.
// >a3 : AlsoInstanceOfA
// >   : ^^^^^^^^^^^^^^^
// >new A() : A
// >        : ^
// >A : typeof A
// >  : ^^^^^^^^



/**
 * However, at least we can alias the constructor
 */
const AliasOfA = A;

/**
 * As expected, this works - this `instanceof` of both sides is the same.
 */
const ax: instanceof AliasOfA = new A() as instanceof A;

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


