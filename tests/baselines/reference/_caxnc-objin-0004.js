//// [_caxnc-objin-0004.ts]
declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
    const ainx = "a" in x;
    ainx; // expect true
}


//// [_caxnc-objin-0004.js]
"use strict";
if ("a" in x) {
    x;
    var ainx = "a" in x;
    ainx; // expect true
}


//// [_caxnc-objin-0004.d.ts]
declare function maybe(): boolean;
declare type T = {
    a: string;
} | {
    b: number;
};
declare const x: T;
