//// [_caxnc-prop-0020.ts]
declare type X = {
    foo?: { bar: boolean };
};
declare const x:X;

function prop0020(){
    if (x.foo?.bar){
    }
    else {
        x;
        x.foo;
        const z = x.foo?.bar;
        z;
    }
}

//// [_caxnc-prop-0020.js]
"use strict";
function prop0020() {
    var _a, _b;
    if ((_a = x.foo) === null || _a === void 0 ? void 0 : _a.bar) {
    }
    else {
        x;
        x.foo;
        var z = (_b = x.foo) === null || _b === void 0 ? void 0 : _b.bar;
        z;
    }
}


//// [_caxnc-prop-0020.d.ts]
declare type X = {
    foo?: {
        bar: boolean;
    };
};
declare const x: X;
declare function prop0020(): void;
