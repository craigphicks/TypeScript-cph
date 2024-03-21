//// [_caxnc-prop-0031.ts]
declare type X = {
    a1?:{a2?:{a3?:1|2}};
};
declare const x:X|null;

function prop0021(){
    if (x?.a1?.a2?.a3){
        x;
        x.a1;
        x.a1.a2;
        x.a1.a2.a3;
    }
}

//// [_caxnc-prop-0031.js]
"use strict";
function prop0021() {
    var _a, _b;
    if ((_b = (_a = x === null || x === void 0 ? void 0 : x.a1) === null || _a === void 0 ? void 0 : _a.a2) === null || _b === void 0 ? void 0 : _b.a3) {
        x;
        x.a1;
        x.a1.a2;
        x.a1.a2.a3;
    }
}


//// [_caxnc-prop-0031.d.ts]
declare type X = {
    a1?: {
        a2?: {
            a3?: 1 | 2;
        };
    };
};
declare const x: X | null;
declare function prop0021(): void;
