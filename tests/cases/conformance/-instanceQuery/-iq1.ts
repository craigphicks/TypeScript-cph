// @strict: true
// @target: esnext

namespace iq0000 {

declare class A {
    c: number;
    constructor(c: number);
}

declare class C<T> {
    c: T;
    constructor(c: T);
}

const a1 = (new A(12)) as instanceof A;


const c1 = (new C(12)) as instanceof C<number>;

}