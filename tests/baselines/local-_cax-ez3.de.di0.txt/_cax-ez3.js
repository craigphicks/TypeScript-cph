//// [_cax-ez3.ts]
declare type Foo = { 
    foo(x?:number):number[] 
    foo(x?:string,y?:string):string[] 
};
declare type Boo = { 
    foo(x?:bigint):bigint[]  
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
declare const okobj: Readonly<Foo> | Readonly<Boo>;
const isFoo = obj?.foo();
//let x: Readonly<Foo> | Readonly<Boo> | undefined;
if (isFoo) {
    // @ special
    let x = obj;
    let y = x.foo;
    let z = y();
    console.log(z);
} 
isFoo;



// else {
//     // @ special
//     obj.foo;
// }


//// [_cax-ez3.js]
"use strict";
var isFoo = obj === null || obj === void 0 ? void 0 : obj.foo();
//let x: Readonly<Foo> | Readonly<Boo> | undefined;
if (isFoo) {
    // @ special
    var x = obj;
    var y = x.foo;
    var z = y();
    console.log(z);
}
isFoo;
// else {
//     // @ special
//     obj.foo;
// }


//// [_cax-ez3.d.ts]
declare type Foo = {
    foo(x?: number): number[];
    foo(x?: string, y?: string): string[];
};
declare type Boo = {
    foo(x?: bigint): bigint[];
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
declare const okobj: Readonly<Foo> | Readonly<Boo>;
declare const isFoo: number[] | bigint[] | undefined;
