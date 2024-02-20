//// [tests/cases/compiler/-test2/-57087-51.ts] ////

//// [-57087-51.ts]
declare function f1(x:{ a: string } | { b: number }):void;
declare function f2(x:{ a?: string, b?: number }):void;
declare function f3(x:{ a: string, b: number }):void;

type GOR = ((x:{ a: string })=>void) | ((x:{ b: number }) => void);

type GAND = ((x:{ a: string })=>void) & ((x:{ b: number }) => void);


f3 satisfies GAND; // should be false



//// [-57087-51.js]
"use strict";
f3; // should be false
