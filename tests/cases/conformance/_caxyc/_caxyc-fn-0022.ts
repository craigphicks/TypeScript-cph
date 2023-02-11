// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true
declare function foo(a:1,b:2,c:3,d:number):string[];
const z: [number] = [4];
const y = [3,...z] as const;
const x = [2,...y] as const;
const a4 = foo(...[1,...x] as const);
a4; // should be string[]
