// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t22(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d){
        d = c;
        c = b;
        b = maybe();
        if (!b) break;
    }
    let e = b;
    [b,c,d,e];
}
