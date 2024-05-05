// @strict: true
// @target: esnext

namespace iq6a {



const InstanceofObject = Object as any as { new(): instanceof Object };

//const instanceofInstanceofObject = new InstanceofObject();

class InstanceofA extends InstanceofObject {
    constructor() {
        super();
    }
}
/**
 * The above is an abbreviation of:
 * ```
 * class A extends InstanceObject {...}
 * const InstanceofA = A as any as { new(): instanceof A };
 * ```
 */


const instanceOfAInstance = new InstanceofA();
instanceOfAInstance satisfies instanceof Object;

}
