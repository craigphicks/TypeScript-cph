// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
const a1 = foo();
a1; // expect number[]
const a2 = foo(1);
a2; // expect number[]
const a3 = foo(1,"2");
a3; // expect string[]
declare const x: [string,...string[]];
// a4 and a5 may be bugs
const a4 = foo(...[1,...x] as const);
a4; // expect string[] even though there may be too many args
declare const y: [...string[]];
const a5 = foo(...[1,...y] as const);
a5; // expect number[] | string[] ???? but typescript says only string[]
const z: [number,string] = [1,"2"];
const a6 = foo(...z);
a6; // expect string[]
[a1,a2,a3,a4,a5,a6];