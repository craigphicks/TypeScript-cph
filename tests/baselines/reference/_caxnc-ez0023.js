//// [_caxnc-ez0023.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);
if (isFoo===undefined){
    isFoo; // expect undefined
    obja; // expect undefined
    arg; // expect string | number
}


//// [_caxnc-ez0023.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
if (isFoo === undefined) {
    isFoo; // expect undefined
    obja; // expect undefined
    arg; // expect string | number
}


//// [_caxnc-ez0023.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
