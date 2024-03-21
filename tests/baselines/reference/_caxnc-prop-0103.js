//// [_caxnc-prop-0103.ts]
declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop103(){
    if (x?.foo){
        x.foo;
    }
}


//// [_caxnc-prop-0103.js]
"use strict";
function prop103() {
    if (x === null || x === void 0 ? void 0 : x.foo) {
        x.foo;
    }
}


//// [_caxnc-prop-0103.d.ts]
declare type X = {
    foo?: {
        bar: boolean;
    };
};
declare const x: X | undefined;
declare function prop103(): void;
