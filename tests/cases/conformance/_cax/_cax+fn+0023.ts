// @strict: true
// @declaration: true
declare function foo(x:number):number[];
declare function foo(x:string):string[];
declare const a: number | string;
const r = foo(a);
// No overload matches this call.
//   Overload 1 of 2, '(x: number): number[]', gave the following error.
//     Argument of type 'string | number' is not assignable to parameter of type 'number'.
//       Type 'string' is not assignable to type 'number'.
//   Overload 2 of 2, '(x: string): string[]', gave the following error.
//     Argument of type 'string | number' is not assignable to parameter of type 'string'.
//       Type 'number' is not assignable to type 'string'.ts(2769)
