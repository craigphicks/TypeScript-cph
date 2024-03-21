//// [_caxnc-ez0020.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);

function f1() {
    if (isFoo){
    }
    else if (isFoo === 0) {
        obja; // expect FooA
    }
}
function f2() {
    if (isFoo){
    }
    else if (isFoo === 0) {
    }
    else {
        isFoo; // expect undefined
    }
}


//// [_caxnc-ez0020.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
function f1() {
    if (isFoo) {
    }
    else if (isFoo === 0) {
        obja; // expect FooA
    }
}
function f2() {
    if (isFoo) {
    }
    else if (isFoo === 0) {
    }
    else {
        isFoo; // expect undefined
    }
}


//// [_caxnc-ez0020.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
declare function f1(): void;
declare function f2(): void;
