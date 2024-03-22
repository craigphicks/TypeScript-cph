//// [tests/cases/conformance/_caxnc-objin/_caxnc-objin-0002.ts] ////

//// [_caxnc-objin-0002.ts]
declare function maybe(): boolean;
type T = { a: string } | { b: number };
declare const x: T;

if ("a" in x) {
    x;
}
else {
    x;
}
x;

//// [_caxnc-objin-0002.js]
"use strict";
if ("a" in x) {
    x;
}
else {
    x;
}
x;


//// [_caxnc-objin-0002.d.ts]
declare function maybe(): boolean;
type T = {
    a: string;
} | {
    b: number;
};
declare const x: T;
