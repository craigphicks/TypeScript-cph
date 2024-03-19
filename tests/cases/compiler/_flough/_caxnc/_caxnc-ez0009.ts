// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
    foo(...args: any[]): never;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

const isFoo = obja?.foo(arg);
let x = isFoo;
obja;
obja?.foo;
obja?.foo(arg);
isFoo;
