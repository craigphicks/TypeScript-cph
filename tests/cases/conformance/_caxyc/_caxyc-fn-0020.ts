// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

declare type Foo = {
    foo(x?:number):number[]
    foo(x?:number,y?:string):string[]
};
// declare type Boo = {
//     foo(x?:bigint):bigint[]
// };
declare const obj: Readonly<Foo>;

// const a1 = obj.foo();
// const a2 = obj.foo(1);
// const a3 = obj.foo(1,"2");
// const a4 = obj.foo(...[1,"2"] as const);
const z: [number,string] = [1,"2"];
const a5 = obj.foo(...z);
