// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(a:string): "A";
    foo(...args: any[]): undefined;
}
declare interface FooB {
    foo(b:number): "B";
    foo(...args: any[]): undefined;
};
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
const obj = b? obja : objb

if (obj.foo(arg)){
    const x = obj.foo(arg); // x should be "A" | "B"
    obj;
    obj.foo;
    x; // expect "A" | "B" | undefined  (because `if (obj.foo(arg)){...}` doesn't currently narrow signatures)
}
