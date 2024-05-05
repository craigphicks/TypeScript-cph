// @strict: true
// @target: esnext

namespace iq5a {



const InstanceofObject = Object as any as { new(): instanceof Object };

const instanceofInstanceofObject = new InstanceofObject();



class A extends Object {
    constructor() {
        super();
    }
}
const InstanceofA = A as any as { new(): instanceof A };

const instanceOfAInstance = new InstanceofA();
instanceOfAInstance satisfies instanceof Object;

/**
 * The above code has no errors.
 * But it would be convient to be able to write:
 * ```
 * class InstanceofA extends InstanceObject {...}
 * ```
 * to avoid writing
 * ```
 * const InstanceofA = A as any as { new(): instanceof A };
 * ```
 */
}

