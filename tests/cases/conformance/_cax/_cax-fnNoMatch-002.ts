// @strict: true
// @declaration: true
declare function foo(x:string): number;
declare function foo(x?:string,y?:string,...z:string[]): string;
// @ts-ignore : due to error b3 type is number[] & string[], must be handled without crashing
const b3 = foo(undefined,undefined,undefined);
b3; // expect unknown

