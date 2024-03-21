//// [_caxnc-typeUnknown-0000.ts]
declare const pAny: any;
declare const pNever: never;
let x: unknown;
x = x;
x; // expect unknown
x = 123;
x; // expect 123
x = "hello";
x; // exper "hello"
x = [1, 2, 3];
x; // expect number[]
//x = new Error();
x = pAny;
x; // expect any
x = pNever;
x; // expect never



//// [_caxnc-typeUnknown-0000.js]
"use strict";
var x;
x = x;
x; // expect unknown
x = 123;
x; // expect 123
x = "hello";
x; // exper "hello"
x = [1, 2, 3];
x; // expect number[]
//x = new Error();
x = pAny;
x; // expect any
x = pNever;
x; // expect never


//// [_caxnc-typeUnknown-0000.d.ts]
declare const pAny: any;
declare const pNever: never;
declare let x: unknown;
