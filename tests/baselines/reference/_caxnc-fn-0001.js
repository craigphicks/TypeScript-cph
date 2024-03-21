//// [_caxnc-fn-0001.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
};
declare const obja: FooA;
const x = obja.foo("");



//// [_caxnc-fn-0001.js]
"use strict";
;
var x = obja.foo("");


//// [_caxnc-fn-0001.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
}
declare const obja: FooA;
declare const x: "1";
