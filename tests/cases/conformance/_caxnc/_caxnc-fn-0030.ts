// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
declare function foo(...args:any[]): unknown;

const a0 = foo();
a0; // expect unknown
const a1 = foo("");
a1; // expect  unknown
const a2 = foo("","");
a2; // expect unknown
const a3 = foo("","","");
a3; // expect unknown
const a4 = foo("","","","");
a4; // expect unknown
const b1 = foo(undefined);
b1; // expect unknown
const b2 = foo(undefined,undefined);
b2; // expect unknown
const b3 = foo(undefined,undefined,undefined);
b3; // expect unknown
[a0,a1,a2,a3,a4,b1,b2,b3];

