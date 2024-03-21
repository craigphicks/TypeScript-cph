//// [_caxnc-ez0022.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);

if (isFoo){
    isFoo; // expect "1"
    obja; // expect FooA
    arg; // expect string
}
else {
    isFoo; // expect 0 | undefined
    obja; // expect FooA | undefined
    arg; // expect string | number
}


//// [_caxnc-ez0022.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
if (isFoo) {
    isFoo; // expect "1"
    obja; // expect FooA
    arg; // expect string
}
else {
    isFoo; // expect 0 | undefined
    obja; // expect FooA | undefined
    arg; // expect string | number
}


//// [_caxnc-ez0022.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
