// @strict: true
// @declaration: true
declare function foo(a:1,b:2,c:3,d:number):string[];
// const a1 = foo();
// a1;
// const a2 = foo(1);
// a2;
// const a3 = foo(1,"2");
// a3;
const z: [number] = [4];
const y = [3,...z] as const;
const x = [2,...y] as const;
const a4 = foo(...[1,...x] as const);
a4; // should be string[] a
// const z: [number,string] = [1,"2"];
// const a5 = foo(...z);
// a5;
// [a1,a2,a3,a4,a5];