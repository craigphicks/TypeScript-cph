
// @strict: true
// @target: esnext



namespace iq0a {
/**
 * Object is included in the heirarch of all classes
 */

const x = new Object() as instanceof Object;
x satisfies instanceof Object;


class A {};
new A() as instanceof A satisfies instanceof Object; // OK

}

namespace iq1a {

/**
 * Properties pass through the instanceof operator
 */

    class A { a=2; }
    type TA = { [k in keyof A]: A[k] };
    type IA = instanceof A;
    type TIA = { [k in keyof IA]: IA[k] };

    const x : TIA["a"] = 3;

    (0 as any as IA) satisfies A;
    (0 as any as IA) satisfies TA;
    (0 as any as IA) satisfies TIA;

}


















