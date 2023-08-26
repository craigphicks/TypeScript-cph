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
    isFoo; // expect "1"
} else if (obja) {
    obja; // expect FooA
    arg; // expect string | number (correlation with obja not expected)
    isFoo; // expect false (intersectiing with !=="1", not due to evaluation with arg)
} else {
    obja; // expect undefined
    arg; // expect string | number
    isFoo; // expect undefined
}
obja; // expect undefined | FooA
arg; // expect string | number
isFoo; // expect "1" | false | undefined


//// [_caxnc-ez0008.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
//const argIsString = typeof arg === "string";
if (isFoo) {
    obja; // expect FooA
    arg; // expect string
    isFoo; // expect "1"
}
else if (obja) {
    obja; // expect FooA
    arg; // expect string | number (correlation with obja not expected)
    isFoo; // expect false (intersectiing with !=="1", not due to evaluation with arg)
}
else {
    obja; // expect undefined
    arg; // expect string | number
    isFoo; // expect undefined
}
obja; // expect undefined | FooA
arg; // expect string | number
isFoo; // expect "1" | false | undefined


//// [_caxnc-ez0008.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): false;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
