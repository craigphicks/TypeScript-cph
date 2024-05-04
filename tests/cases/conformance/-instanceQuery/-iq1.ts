// @strict: true
// @target: esnext

namespace iq1a {

class A { a=2; }
type TA = { [k in keyof A]: A[k] };
type IA = instanceof A;
type TIA = { [k in keyof IA]: IA[k] };

const x : TIA["a"] = 2

interface B extends IA { b: number; }

const ya : B["a"] = 2;
const yb : B["b"] = 2;

(0 as any as B) satisfies A;
(0 as any as B) satisfies IA;
(0 as any as B) satisfies B;

}