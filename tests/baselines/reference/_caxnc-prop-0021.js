//// [_caxnc-prop-0021.ts]
declare type X = {
    foo?: { bar: boolean };
};
declare const x:X;

function prop0021(){
    if (x.foo?.bar){
        x;
        x.foo;
        // const y = x.foo?.bar;
        // y;
    }
}

//// [_caxnc-prop-0021.js]
"use strict";
function prop0021() {
    var _a;
    if ((_a = x.foo) === null || _a === void 0 ? void 0 : _a.bar) {
        x;
        x.foo;
        // const y = x.foo?.bar;
        // y;
    }
}


//// [_caxnc-prop-0021.d.ts]
declare type X = {
    foo?: {
        bar: boolean;
    };
};
declare const x: X;
declare function prop0021(): void;
