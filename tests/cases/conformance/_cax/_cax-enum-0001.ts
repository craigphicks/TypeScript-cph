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
else if (e===1){
    e; // F.n1 !!!! This makes no "runtime" sense. Should be never.
}


