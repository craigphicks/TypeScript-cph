// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare const enum E {
    n1 = 1,
    n2 = 2,
    sa = "a",
    sb = "b"
};
declare const e: E;
if (e===E.n1){
    e; // E.n1
}

