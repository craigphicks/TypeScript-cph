// @strict: true
// @declaration: true
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
// const a1 = foo();
// a1;
// const a2 = foo(1);
// a2;
// const a3 = foo(1,"2");
// a3;
declare const x: [string,...string[]];
const a4 = foo(...[1,...x] as const);
a4; // should be string[] a
// const z: [number,string] = [1,"2"];
// const a5 = foo(...z);
// a5;
// [a1,a2,a3,a4,a5];