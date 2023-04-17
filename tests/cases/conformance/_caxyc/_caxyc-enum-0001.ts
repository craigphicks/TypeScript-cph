// @floughEnable: true
// @floughConstraintsEnable: true
// @strict: true
// @declaration: true

declare const enum E {
    n1 = 1,
    n2 = 2,
    sa = "a",
    sb = "b"
};
declare const enum F {
    n1 = 1,
    n2 = 2,
    sa = "a",
    sb = "b"
};

declare const e: E|F;

// The "else" clause has an impossible inference.
// Therefore, it would be proper to evaluate the "if" clause using the literal "1" on the rhs,
// ignoring the leading "E", and not narrowing e to type E, but leaving it as E|F.

if (e===E.n1){
    e; // E.n1
}
// @ts-ignore to suppress TS2367
else if (e===1){
    // Compile error TS2367 doesn't show up in the GUI, only compile time
    // Error TS2367: This condition will always return 'false' since the types '2 | "a" | "b"' and '1' have no overlap.
    e; // F.n1 !!!! This makes no "runtime" sense. Should be never.
}


