//// [_caxyc-fn-0020.ts]
declare type Foo = {
    foo(x?:number):number[]
    foo(x?:number,y?:string):string[]
};
// declare type Boo = {
//     foo(x?:bigint):bigint[]
// };
declare const obj: Readonly<Foo>;

// const a1 = obj.foo();
// const a2 = obj.foo(1);
// const a3 = obj.foo(1,"2");
// const a4 = obj.foo(...[1,"2"] as const);
const z: [number,string] = [1,"2"];
const a5 = obj.foo(...z);


//// [_caxyc-fn-0020.js]
"use strict";
// const a1 = obj.foo();
// const a2 = obj.foo(1);
// const a3 = obj.foo(1,"2");
// const a4 = obj.foo(...[1,"2"] as const);
var z = [1, "2"];
var a5 = obj.foo.apply(obj, z);


//// [_caxyc-fn-0020.d.ts]
declare type Foo = {
    foo(x?: number): number[];
    foo(x?: number, y?: string): string[];
};
declare const obj: Readonly<Foo>;
declare const z: [number, string];
declare const a5: string[];
