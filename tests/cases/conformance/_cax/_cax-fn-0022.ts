// @strict: true
// @declaration: true
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];

const a0 = foo();
a0;
// const a1 = foo("");
// a1;
// const a2 = foo("","");
// a2;
// const a3 = foo("","","");
// a3;
// const a4 = foo("","","","");
// a4;
// const b1 = foo(undefined);
// b1;
// const b2 = foo(undefined,undefined);
// b2;
// @ts-ignore last undefined is not allowed
const b3 = foo(undefined,undefined,undefined);
b3;
[a0,b3];
// [a0,a1,a2,a3,a4,b1,b2,b3];

