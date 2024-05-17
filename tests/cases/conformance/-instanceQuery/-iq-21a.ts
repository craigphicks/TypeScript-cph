// @strict: true
// @target: esnext

namespace instanceQuery21a {

    declare class InstanceofA extends (Object as any as { new(): instanceof Object } ){ a: number };
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK

}

