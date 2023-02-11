//// [_caxyc-fn-0003.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
};
declare const obja: undefined | FooA;
declare const arg: string | number;
if (obja?.foo(arg)){
    obja; // should be FooA
    arg; // should be string
    const x = obja.foo(arg); // x should be "1"
}
else if (obja) {
    arg; // should be number
    const x = obja.foo(arg); // x should be undefined
} else {
    obja; // should be undefined
}


//// [_caxyc-fn-0003.js]
"use strict";
;
if (obja === null || obja === void 0 ? void 0 : obja.foo(arg)) {
    obja; // should be FooA
    arg; // should be string
    var x = obja.foo(arg); // x should be "1"
}
else if (obja) {
    arg; // should be number
    var x = obja.foo(arg); // x should be undefined
}
else {
    obja; // should be undefined
}


//// [_caxyc-fn-0003.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
