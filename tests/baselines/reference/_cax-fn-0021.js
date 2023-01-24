//// [_cax-fn-0021.ts]
declare type Foo = {
    foo(x?:number):number[]
    foo(x?:number,y?:string):string[]
};
declare const obj: Readonly<Foo>;
const a1 = obj.foo();
const a2 = obj.foo(1);
const a3 = obj.foo(1,"2");
const a4 = obj.foo(...[1,"2"] as const);
const z: [number,string] = [1,"2"];
const a5 = obj.foo(...z);


//// [_cax-fn-0021.js]
"use strict";
var a1 = obj.foo();
var a2 = obj.foo(1);
var a3 = obj.foo(1, "2");
var a4 = obj.foo.apply(obj, [1, "2"]);
var z = [1, "2"];
var a5 = obj.foo.apply(obj, z);


//// [_cax-fn-0021.d.ts]
declare type Foo = {
    foo(x?: number): number[];
    foo(x?: number, y?: string): string[];
};
declare const obj: Readonly<Foo>;
declare const a1: number[];
declare const a2: number[];
declare const a3: string[];
declare const a4: string[];
declare const z: [number, string];
declare const a5: string[];
