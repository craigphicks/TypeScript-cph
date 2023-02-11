//// [_cax-ez0004.ts]
declare type Foo = {
    foo(x?:number):number[]
    foo(x?:string,y?:string):string[]
};
declare type Boo = {
    foo(x?:bigint):bigint[]
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    let x = obj;
}
else {
    obj;
}

//// [_cax-ez0004.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo();
if (isFoo) {
    var x = obj;
}
else {
    obj;
}


//// [_cax-ez0004.d.ts]
declare type Foo = {
    foo(x?: number): number[];
    foo(x?: string, y?: string): string[];
};
declare type Boo = {
    foo(x?: bigint): bigint[];
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
declare const isFoo: number[] | bigint[] | undefined;
