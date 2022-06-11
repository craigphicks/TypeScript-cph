//// [controlFlowAliasFunc3.ts]
declare function fn():number;
declare function fb():boolean;
declare const foo: undefined | { fb: typeof fb };
const z = fn() ?? foo?.fb(); 



//// [controlFlowAliasFunc3.js]
"use strict";
var _a;
var z = (_a = fn()) !== null && _a !== void 0 ? _a : foo === null || foo === void 0 ? void 0 : foo.fb();


//// [controlFlowAliasFunc3.d.ts]
declare function fn(): number;
declare function fb(): boolean;
declare const foo: undefined | {
    fb: typeof fb;
};
declare const z: number;
