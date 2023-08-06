//// [_caxnc-ez0014.ts]
declare type Boo = {
    foo():bigint[]
};
declare const obj: Readonly<Boo> | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    // check merge after end if scope
}
isFoo; // isFoo should be bigint[] | undefined


//// [_caxnc-ez0014.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo();
if (isFoo) {
    // check merge after end if scope
}
isFoo; // isFoo should be bigint[] | undefined


//// [_caxnc-ez0014.d.ts]
declare type Boo = {
    foo(): bigint[];
};
declare const obj: Readonly<Boo> | undefined;
declare const isFoo: bigint[] | undefined;
