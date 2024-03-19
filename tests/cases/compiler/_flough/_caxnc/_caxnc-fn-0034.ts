// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
// By adding the following overload, the error goes away.
// Although the last overload is always matched,
// when either/both of the first two overloads match, the correct floughType is returned
// because never | <not never> = <not never>. When the last overload match
declare function foo(...args:any[]): never;

const a0 = foo();
a0; // expect string[]
const a1 = foo("");
a1; // expect  number[] | string[]
const a2 = foo("","");
a2; // expect string[]
const a3 = foo("","","");
a3; // expect string[]
const a4 = foo("","","","");
a4; // expect string[]
const b1 = foo(undefined);
b1; // expect string[]
const b2 = foo(undefined,undefined);
b2; // expect string[]
const b3 = foo(undefined,undefined,undefined);
b3; // expect never
const c0 = a0||a1||a2||a3||a4||b1||b2||b3; // never
c0; // expected string[]
const c1 = [a0,a1,a2,a3,a4,b1,b2,b3]; // never
c1; // expected never;
const c2 = a0||a1||a2||a3||a4||b1||b2||b3; // never
c2; // expected never
