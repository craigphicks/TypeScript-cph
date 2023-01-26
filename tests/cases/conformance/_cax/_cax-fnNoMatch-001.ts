// @strict: true
// @declaration: true
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
// @ts-ignore : due to error b3 type is number[] & string[], must be handled without crashing
const b3 = foo(undefined,undefined,undefined);
// No overload matches this call.
//   Overload 1 of 4, '(x?: string | undefined, y?: string | undefined, ...z: string[]): string[]', gave the following error.
//     Argument of type 'undefined' is not assignable to parameter of type 'string'.
//   Overload 2 of 4, '(x?: string | undefined, y?: string | undefined, ...z: string[]): string[]', gave the following error.
//     Argument of type 'undefined' is not assignable to parameter of type 'string'.ts(2769)
b3; // expect??

