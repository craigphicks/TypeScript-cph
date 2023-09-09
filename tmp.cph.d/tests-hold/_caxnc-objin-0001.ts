// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

function fin1(x: { a: string } | { b: number }){
    if ("a" in x) {
        x;
    }
    else {
        x;
    }
    x;
}