//// [_caxnc-fn-0033.ts]
declare function foo(x:string): number[];
declare function foo(x?:string,y?:string,...z:string[]): string[];
declare function foo(...args:any[]): never;

// const a0 = foo();
// a0; // expect string[]
// const a1 = foo("");
// a1; // expect  number[] | string[]
// const a2 = foo("","");
// a2; // expect string[]
// const a3 = foo("","","");
// a3; // expect string[]
// const a4 = foo("","","","");
// a4; // expect string[]
// const b1 = foo(undefined);
// b1; // expect string[]
// const b2 = foo(undefined,undefined);
// b2; // expect string[]
const b3 = foo(undefined,undefined,undefined);
b3; // expect never
[b3];
//[a0,a1,a2,a3,a4,b1,b2,b3];



//// [_caxnc-fn-0033.js]
"use strict";
// const a0 = foo();
// a0; // expect string[]
// const a1 = foo("");
// a1; // expect  number[] | string[]
// const a2 = foo("","");
// a2; // expect string[]
// const a3 = foo("","","");
// a3; // expect string[]
// const a4 = foo("","","","");
// a4; // expect string[]
// const b1 = foo(undefined);
// b1; // expect string[]
// const b2 = foo(undefined,undefined);
// b2; // expect string[]
var b3 = foo(undefined, undefined, undefined);
b3; // expect never
[b3];
//[a0,a1,a2,a3,a4,b1,b2,b3];


//// [_caxnc-fn-0033.d.ts]
declare function foo(x: string): number[];
declare function foo(x?: string, y?: string, ...z: string[]): string[];
declare function foo(...args: any[]): never;
declare const b3: never;
