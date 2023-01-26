// @strict: true
// @declaration: true
declare function foo(x?:number):number[];
declare function foo(x?:number,y?:string,z?:string):string[];
declare const b: boolean;
const a0 = [] as const;
const a1 = [1,"2"] as const;
const a = b ? a1 : a0;
const r = foo(...a);
// No overload matches this call.
//   Overload 1 of 2, '(x?: number | undefined): number[]', gave the following error.
//     Argument of type '1 | "2"' is not assignable to parameter of type 'number | undefined'.
//       Type 'string' is not assignable to type 'number'.
//   Overload 2 of 2, '(x?: number | undefined, y?: string | undefined, z?: string | undefined): string[]', gave the following error.
//     Argument of type '1 | "2"' is not assignable to parameter of type 'number | undefined'.ts(2769)

