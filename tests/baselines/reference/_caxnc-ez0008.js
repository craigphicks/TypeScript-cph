//// [_caxnc-ez0008.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): false;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);
//const argIsString = typeof arg === "string";
if (isFoo){
    obja; // expect FooA
    arg; // expect string
} else if (obja) {
    //obja;
    arg; // expect number (because of the correlation with the type of obja)
}


//// [_caxnc-ez0008.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
//const argIsString = typeof arg === "string";
if (isFoo) {
    obja; // expect FooA
    arg; // expect string
}
else if (obja) {
    //obja;
    arg; // expect number (because of the correlation with the type of obja)
}


//// [_caxnc-ez0008.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): false;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
