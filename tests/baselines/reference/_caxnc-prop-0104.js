//// [_caxnc-prop-0104.ts]
declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop0104(){
    if (!x?.foo?.bar){
        x?.foo?.bar;
    }
}

//// [_caxnc-prop-0104.js]
"use strict";
function prop0104() {
    var _a, _b;
    if (!((_a = x === null || x === void 0 ? void 0 : x.foo) === null || _a === void 0 ? void 0 : _a.bar)) {
        (_b = x === null || x === void 0 ? void 0 : x.foo) === null || _b === void 0 ? void 0 : _b.bar;
    }
}


//// [_caxnc-prop-0104.d.ts]
declare type X = {
    foo?: {
        bar: boolean;
    };
};
declare const x: X | undefined;
declare function prop0104(): void;
