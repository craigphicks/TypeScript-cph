
// @strict: true
// @target: esnext


namespace iq0 {

declare class C<T extends number | string = string> {
    c: T;
    constructor(c: T);
}

C.prototype; // C<any>; this is correct according to the spec


const CNumberConstructor = C<number>; // the variable CNumberConstructor should have type { c:number, constructor(c:number): C<number>, prototype: C<any> }
type CNumberConstructor = typeof CNumberConstructor; // declare the type
type CnumberPrototype = CNumberConstructor["prototype"]; // C<any> ; correct according to the TypeScript spec

type CNumberConstructorInstanceQueryType = instanceof CNumberConstructor; // should be "instanceof C & C<number>"


C.prototype; // make sure it hasn't changed


}