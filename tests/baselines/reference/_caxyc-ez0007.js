//// [_caxyc-ez0007.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo){
    const x = obja.foo(arg);
    argIsString;
}
else if (obja) {
    const y = obja.foo(arg);
    argIsString;
}

//// [_caxyc-ez0007.js]
"use strict";
;
// checknig isFoo in combo with another condition argIsString
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
var argIsString = typeof arg === "string";
if (isFoo) {
    var x = obja.foo(arg);
    argIsString;
}
else if (obja) {
    var y = obja.foo(arg);
    argIsString;
}


//// [_caxyc-ez0007.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
declare const argIsString: boolean;
