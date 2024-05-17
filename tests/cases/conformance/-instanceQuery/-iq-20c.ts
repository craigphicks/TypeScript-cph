// @strict: true
// @target: esnext

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
