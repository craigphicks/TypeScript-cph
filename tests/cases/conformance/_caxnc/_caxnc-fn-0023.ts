// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
const a2 = foo(1);
a2; // expect number[]
