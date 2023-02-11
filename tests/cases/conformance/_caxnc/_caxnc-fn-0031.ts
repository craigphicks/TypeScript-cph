// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
const b3 = foo(undefined,undefined,undefined);
b3; // expect unknown

