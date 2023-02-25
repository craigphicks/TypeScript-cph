// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t21(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (d){
        d = c;
        c = b;
        if (!b) break;
        b = !b;
        b;
    }
    let e = b;
    [b,c,d,e];
}
