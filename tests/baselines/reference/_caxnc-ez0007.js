//// [_caxnc-ez0007.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
// @ts-expect-error
const isFoo = obja?.foo(arg);
if (isFoo){
    obja;
    arg;
    isFoo;
}
else if (isFoo === 0) {
    obja;
    arg;
    isFoo;
}
else {
    obja;
    arg;
    //isFoo; currently causing an exception because the case of no logical object is not handled
}
obja;
arg;
isFoo;


//// [_caxnc-ez0007.js]
"use strict";
;
// checknig isFoo in combo with another condition argIsString
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
if (isFoo) {
    obja;
    arg;
    isFoo;
}
else if (isFoo === 0) {
    obja;
    arg;
    isFoo;
}
else {
    obja;
    arg;
    //isFoo; currently causing an exception because the case of no logical object is not handled
}
obja;
arg;
isFoo;


//// [_caxnc-ez0007.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
