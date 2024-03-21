//// [_caxnc-ez0010.ts]
type Foo = (x?:number) => number[];
//type Boo = (x?:bigint) => bigint[]
declare const f: Foo;
const v = f();


//// [_caxnc-ez0010.js]
"use strict";
var v = f();


//// [_caxnc-ez0010.d.ts]
declare type Foo = (x?: number) => number[];
declare const f: Foo;
declare const v: number[];
