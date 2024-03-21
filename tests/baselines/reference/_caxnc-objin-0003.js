//// [_caxnc-objin-0003.ts]
declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
    let ainx = "a" in x;
    ainx; // expect true
}


//// [_caxnc-objin-0003.js]
"use strict";
if ("a" in x) {
    x;
    var ainx = "a" in x;
    ainx; // expect true
}


//// [_caxnc-objin-0003.d.ts]
declare function maybe(): boolean;
declare type T = {
    a: string;
} | {
    b: number;
};
declare const x: T;
