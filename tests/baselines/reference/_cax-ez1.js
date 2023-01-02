//// [_cax-ez1.ts]
declare type Foo = { readonly foo: number[] };

declare const obj: Foo | undefined;
const isObj = !!obj;
if (isObj) {
    obj.foo;
} else {
    obj.foo;
}

//// [_cax-ez1.js]
"use strict";
var isObj = !!obj;
if (isObj) {
    obj.foo;
}
else {
    obj.foo;
}


//// [_cax-ez1.d.ts]
declare type Foo = {
    readonly foo: number[];
};
declare const obj: Foo | undefined;
declare const isObj: boolean;
