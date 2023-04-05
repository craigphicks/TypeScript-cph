//// [_caxnc-ez0008.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): false;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo){
    obja;
    arg;
} else if (obja) {
    obja;
    arg;
}


//// [_caxnc-ez0008.js]
"use strict";
;
// checknig isFoo in combo with another condition argIsString
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
var argIsString = typeof arg === "string";
if (isFoo) {
    obja;
    arg;
}
else if (obja) {
    obja;
    arg;
}


//// [_caxnc-ez0008.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): false;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
declare const argIsString: boolean;
