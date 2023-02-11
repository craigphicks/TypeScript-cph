//// [_caxyc-ez0002.ts]
declare type Foo = { readonly foo: (x?:number)=>number[] };
declare const obj: Foo | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    obj.foo(); // obj should be of type Foo
}


//// [_caxyc-ez0002.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo();
if (isFoo) {
    obj.foo(); // obj should be of type Foo
}


//// [_caxyc-ez0002.d.ts]
declare type Foo = {
    readonly foo: (x?: number) => number[];
};
declare const obj: Foo | undefined;
declare const isFoo: number[] | undefined;
