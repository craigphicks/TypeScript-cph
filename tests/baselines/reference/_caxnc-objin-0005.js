//// [_caxnc-objin-0005.ts]
declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
    "b" in x; // checker resolves this as "boolean", although flough resolves it as "false"
}


//// [_caxnc-objin-0005.js]
"use strict";
if ("a" in x) {
    x;
    "b" in x; // checker resolves this as "boolean", although flough resolves it as "false"
}


//// [_caxnc-objin-0005.d.ts]
declare function maybe(): boolean;
declare type T = {
    a: string;
} | {
    b: number;
};
declare const x: T;
