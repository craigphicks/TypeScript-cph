//// [_caxnc-ez0020.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);
if (isFoo){
    // obja;
    // arg;
    // isFoo;
}
else if (isFoo === 0) {
    // @ts-dev-debugger
    obja;
    // arg;
    // isFoo;
}
// else {
//     obja;
//     arg;
//     isFoo;
// }
// obja;
// arg;
// isFoo;


//// [_caxnc-ez0020.js]
"use strict";
;
// @ts-expect-error
var isFoo = obja === null || obja === void 0 ? void 0 : obja.foo(arg);
if (isFoo) {
    // obja;
    // arg;
    // isFoo;
}
else if (isFoo === 0) {
    // @ts-dev-debugger
    obja;
    // arg;
    // isFoo;
}
// else {
//     obja;
//     arg;
//     isFoo;
// }
// obja;
// arg;
// isFoo;


//// [_caxnc-ez0020.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): 0;
}
declare const obja: undefined | FooA;
declare const arg: string | number;
declare const isFoo: undefined;
