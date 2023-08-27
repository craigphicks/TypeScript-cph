//// [_caxnc-enum-0002.ts]
declare const enum E {
    n1 = 1,
    n2 = 2,
    sa = "a",
    sb = "b"
};
declare const e: E;
if (e===E.n1){
    e; // E.n1
}



//// [_caxnc-enum-0002.js]
"use strict";
;
if (e === 1 /* E.n1 */) {
    e; // E.n1
}


//// [_caxnc-enum-0002.d.ts]
declare const enum E {
    n1 = 1,
    n2 = 2,
    sa = "a",
    sb = "b"
}
declare const e: E;
