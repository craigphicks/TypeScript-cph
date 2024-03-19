// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "A";
    foo(...args:any[]): unknown;
}
declare const obja: FooA;
declare const arg: string;
const x = obja.foo(arg);
x; // x should be unknown
