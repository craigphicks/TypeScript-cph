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
        x.foo?.bar;
        const z = x.foo?.bar;
        z;
    }
}

//// [_caxnc-prop-0020.js]
"use strict";
function prop0020() {
    var _a, _b, _c;
    if ((_a = x.foo) === null || _a === void 0 ? void 0 : _a.bar) {
    }
    else {
        x;
        x.foo;
        (_b = x.foo) === null || _b === void 0 ? void 0 : _b.bar;
        var z = (_c = x.foo) === null || _c === void 0 ? void 0 : _c.bar;
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
