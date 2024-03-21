//// [tests/cases/conformance/_caxnc/_caxnc-ez0001.ts] ////

//// [_caxnc-ez0001.ts]
declare type Foo = { readonly foo: number[] };

declare const obj: Foo | undefined;
const isObj = !!obj;
if (isObj) {
    obj.foo;
} else {
    obj.foo;
}

//// [_caxnc-ez0001.js]
"use strict";
var isObj = !!obj;
if (isObj) {
    obj.foo;
}
else {
    obj.foo;
}


//// [_caxnc-ez0001.d.ts]
declare type Foo = {
    readonly foo: number[];
};
declare const obj: Foo | undefined;
declare const isObj: boolean;
