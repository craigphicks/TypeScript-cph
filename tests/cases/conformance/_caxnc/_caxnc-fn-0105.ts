// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "A";
    foo(...args:any[]): undefined;
}
declare interface FooB {
    foo(b:number): "B";
    foo(...args:any[]): undefined;
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
