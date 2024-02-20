//// [tests/cases/compiler/-test2/-57087-52.ts] ////

//// [-57087-52.ts]
declare function f1(x:{ a: string } | { b: number }):void;
declare function f2(x:{ a?: string, b?: number }):void;
declare function f3(x:{ a: string, b: number }):void;

type GOR = ((x:{ a: string })=>void) | ((x:{ b: number }) => void);

type GAND = ((x:{ a: string })=>void) & ((x:{ b: number }) => void);


(0 as any as GOR) satisfies GAND; // should be false



//// [-57087-52.js]
"use strict";
0; // should be false
