//// [_caxnc-ez0021.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);
isFoo; // expect "1" | 0 | undefined



//// [_caxnc-ez0021.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
isFoo; // expect "1" | 0 | undefined


//// [_caxnc-ez0021.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
