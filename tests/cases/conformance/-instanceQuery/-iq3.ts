// @strict: true
// @target: esnext

class A {};
type InstanceOfA = instanceof A;
function createInstanceOfA() : InstanceOfA {
    return new A() as InstanceOfA;
}


interface AlsoInstanceOfA extends InstanceOfA {}
createInstanceOfA() satisfies AlsoInstanceOfA;  // OK)

interface NotInstanceOfA extends InstanceOfA { b: number }
function createNotInstanceOfA() {
    const a = new A() as any as NotInstanceOfA;
    a.b = 1;
    return a;
}

createNotInstanceOfA() satisfies instanceof A;  // ok
createNotInstanceOfA() satisfies InstanceOfA;  // ok

createNotInstanceOfA() satisfies NotInstanceOfA;  // ok
createInstanceOfA() satisfies NotInstanceOfA;  // structure error


class B extends A { b: number }
new B() as instanceof B satisfies NotInstanceOfA;  // OK,

createNotInstanceOfA() satisfies instanceof B;  // instanceof error




