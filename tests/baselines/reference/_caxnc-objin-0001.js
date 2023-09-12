//// [_caxnc-objin-0001.ts]
function fin1(x: { a: string } | { b: number }){
    if ("a" in x) {
        x;
    }
    else {
        x;
    }
    x;
}

//// [_caxnc-objin-0001.js]
"use strict";
function fin1(x) {
    if ("a" in x) {
        x;
    }
    else {
        x;
    }
    x;
}


//// [_caxnc-objin-0001.d.ts]
declare function fin1(x: {
    a: string;
} | {
    b: number;
}): void;
