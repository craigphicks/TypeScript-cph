// @floughEnable: true
// @floughConstraintsEnable: false
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

if (obj===obja){
    obj; // expect FooA | FooB
    obj.foo
}
else {
    obj; // expect FooA | FooB (even if left and right are FooA, the comparison result could still be false)
    obj.foo
}
