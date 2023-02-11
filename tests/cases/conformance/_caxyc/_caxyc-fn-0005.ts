// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "A";
    foo(...args:any[]): unknown;
}
declare interface FooB {
    foo(b:number): "B";
    foo(...args:any[]): unknown;
};
declare const obja: FooA;
declare const objb: FooB;
declare const arg: string | number;
declare const b: boolean;
const obj = b? obja : objb

if (obj===obja && arg==="one" || obj===objb && arg===1){
    arg; // should be "one" | 1
    const x = obj.foo(arg);
    obj; // obj should be FooA | FooB
    x; // x should be "A" | "B",
}
