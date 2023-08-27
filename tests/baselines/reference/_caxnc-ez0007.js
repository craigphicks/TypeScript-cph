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
    obja; // expect FooA
    arg; // expect string
    isFoo; // expect "1"
}
else if (isFoo === 0) {
    obja; // expect FooA
    arg; // expect number
    isFoo; // expect 0
}
else {
    obja; // expect undefined
    arg; // expect string | number
    isFoo; // expect undefined
}
obja; // expect undefined | FooA
arg; // expect string | number
isFoo; // expect undefined | "1" | 0


//// [_caxnc-ez0007.js]
"use strict";
;
// checknig isFoo in combo with another condition argIsString
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
if (isFoo) {
    obja; // expect FooA
    arg; // expect string
    isFoo; // expect "1"
}
else if (isFoo === 0) {
    obja; // expect FooA
    arg; // expect number
    isFoo; // expect 0
}
else {
    obja; // expect undefined
    arg; // expect string | number
    isFoo; // expect undefined
}
obja; // expect undefined | FooA
arg; // expect string | number
isFoo; // expect undefined | "1" | 0


//// [_caxnc-ez0007.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
