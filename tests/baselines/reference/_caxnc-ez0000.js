//// [_caxnc-ez0000.ts]
declare type Foo = { readonly foo: (x?:number)=>number[] };
declare const obj: Foo | undefined;
const isFoo = obj?.foo();


//// [_caxnc-ez0000.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo();


//// [_caxnc-ez0000.d.ts]
declare type Foo = {
    readonly foo: (x?: number) => number[];
};
declare const obj: Foo | undefined;
declare const isFoo: number[] | undefined;
