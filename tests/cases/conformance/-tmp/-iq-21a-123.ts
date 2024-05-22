// @strict: true
// @target: esnext

namespace instanceQuery21a1 {
    declare class InstanceofA extends (Object as any as { new(): instanceof Object } ){ a: number };
    InstanceofA.prototype
    new InstanceofA();
}

namespace instanceQuery21a2 {
    declare class InstanceofB<T> extends (Object as any as { new(): instanceof Object } ){ a: number };
    InstanceofB.prototype
    new InstanceofB();
}

namespace instanceQuery21a3 {
    declare class X<T> extends Object { x: T };
    X.prototype
    new X();
}