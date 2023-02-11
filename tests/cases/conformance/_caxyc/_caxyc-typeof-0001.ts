// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true 
// @declaration: true

const x = typeof 1;
x;
// the nominal type of the result of a typeof operator is widened to the union all 8 types,
// not by flow but by somewhere in checkExpression.  Therefore this gives an error:
// !!! error TS2322: Type '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' is not assignable to type '"string" | "number"'.
// !!! error TS2322:   Type '"bigint"' is not assignable to type '"string" | "number"'.
const y: "number" | "string" = typeof 1;
// However in the mrNarrow flow processing, the narrowed type is used.
y;
