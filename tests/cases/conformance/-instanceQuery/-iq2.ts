// @strict: true
// @target: esnext

namespace iq0000 {

declare class C<T> {
    c: T;
    constructor(c: T);
}

const CNumber = C<number>; // the variable CNumberConstructor should have type { c:number, constructor(c:number): C<number>, prototype: C<any> }


declare const c1: instanceof CNumber;

}