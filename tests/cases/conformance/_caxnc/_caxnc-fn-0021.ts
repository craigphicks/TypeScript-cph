// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
declare const x: [string,...string[]];
const a4 = foo(...[1,...x] as const);
a4; // should be string[]
