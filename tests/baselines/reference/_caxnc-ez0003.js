//// [_caxnc-ez0003.ts]
declare type Foo = {
    foo(x?:number):number[]
    foo(x?:string,y?:string):string[]
};
declare type Boo = {
    foo(x?:bigint):bigint[]
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
const isFoo = obj?.foo(); // isFoo should be number[] | bigint[] | undefined, because string[] is shadowed in case of empty input
isFoo; // isFoo should be number[] | string[] | bigint[] | undefined

if (isFoo) {
    isFoo; // isFoo should be number[] | string[] | bigint[]
    let x = obj; // x should be Readonly<Foo> | Readonly<Boo>
    let y = x.foo; // should be no error
    let z = y(); // z should be number[] | string[] | bigint[]
    console.log(z); // again z should be number[] | string[] | bigint[]
}
isFoo; // isFoo should be number[] | string[] | bigint[] | undefined


//// [_caxnc-ez0003.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo(); // isFoo should be number[] | bigint[] | undefined, because string[] is shadowed in case of empty input
isFoo; // isFoo should be number[] | string[] | bigint[] | undefined
if (isFoo) {
    isFoo; // isFoo should be number[] | string[] | bigint[]
    var x = obj; // x should be Readonly<Foo> | Readonly<Boo>
    var y = x.foo; // should be no error
    var z = y(); // z should be number[] | string[] | bigint[]
    console.log(z); // again z should be number[] | string[] | bigint[]
}
isFoo; // isFoo should be number[] | string[] | bigint[] | undefined


//// [_caxnc-ez0003.d.ts]
declare type Foo = {
    foo(x?: number): number[];
    foo(x?: string, y?: string): string[];
};
declare type Boo = {
    foo(x?: bigint): bigint[];
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
declare const isFoo: number[] | bigint[] | undefined;
