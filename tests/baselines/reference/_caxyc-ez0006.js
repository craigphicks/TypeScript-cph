//// [_caxyc-ez0006.ts]
// Note that Foo1.foo1 is overwritable, but it shouldn't make a difference because the type must be the same.
declare type Foo1 = { foo1: ()=> number[] };
declare const obj1: undefined | Foo1;
const isFoo1 = obj1?.foo1();
if (isFoo1){
    const x2 = obj1.foo1();
}

//// [_caxyc-ez0006.js]
"use strict";
var isFoo1 = obj1 === null || obj1 === void 0 ? void 0 : obj1.foo1();
if (isFoo1) {
    var x2 = obj1.foo1();
}


//// [_caxyc-ez0006.d.ts]
declare type Foo1 = {
    foo1: () => number[];
};
declare const obj1: undefined | Foo1;
declare const isFoo1: number[] | undefined;
