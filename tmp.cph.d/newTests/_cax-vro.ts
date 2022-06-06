// @strict: true
// @declaration: true

export type Foo = {
    foo:()=>number[];
};
export type Boo = {
    readonly foo?:()=>number[];
};
declare const objf: undefined | Foo;
declare const objb: undefined | Boo;
declare const objfb: undefined | Foo | Boo;


const isFoo = objf?.foo();
const isBoo = objb?.foo && objb.foo();
const isFBoo = objfb?.foo && objfb.foo();



