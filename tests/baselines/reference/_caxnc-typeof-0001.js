//// [tests/cases/conformance/_caxnc/_caxnc-typeof-0001.ts] ////

//// [_caxnc-typeof-0001.ts]
const x = typeof 1;
x;
// the nominal type of the result of a typeof operator is widened to the union all 8 types,
// not by flow but by somewhere in checkExpression.  Therefore this gives an error:
// !!! error TS2322: Type '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' is not assignable to type '"string" | "number"'.
// !!! error TS2322:   Type '"bigint"' is not assignable to type '"string" | "number"'.
const y: "number" | "string" = typeof 1;
// However in the mrNarrow flow processing, the narrowed type is used.
y;


//// [_caxnc-typeof-0001.js]
"use strict";
var x = typeof 1;
x;
// the nominal type of the result of a typeof operator is widened to the union all 8 types,
// not by flow but by somewhere in checkExpression.  Therefore this gives an error:
// !!! error TS2322: Type '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' is not assignable to type '"string" | "number"'.
// !!! error TS2322:   Type '"bigint"' is not assignable to type '"string" | "number"'.
var y = typeof 1;
// However in the mrNarrow flow processing, the narrowed type is used.
y;


//// [_caxnc-typeof-0001.d.ts]
declare const x: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
declare const y: "number" | "string";
