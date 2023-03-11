//// [_caxnc-prop-0002.ts]
declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop0002(){
    if (x?.foo?.bar){
        let y = x.foo.bar;
        y;
    }
    else {
        let z = x?.foo?.bar;
        z;
    }
}

//// [_caxnc-prop-0002.js]
"use strict";
function prop0002() {
    var _a, _b;
    if ((_a = x === null || x === void 0 ? void 0 : x.foo) === null || _a === void 0 ? void 0 : _a.bar) {
        var y = x.foo.bar;
        y;
    }
    else {
        var z = (_b = x === null || x === void 0 ? void 0 : x.foo) === null || _b === void 0 ? void 0 : _b.bar;
        z;
    }
}


//// [_caxnc-prop-0002.d.ts]
declare type X = {
    foo?: {
        bar: boolean;
    };
};
declare const x: X | undefined;
declare function prop0002(): void;
