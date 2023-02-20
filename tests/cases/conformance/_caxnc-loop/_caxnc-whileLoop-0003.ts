// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// This loop converges after 1 iteration, but never terminates, so e is never
function t3(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (d){
        d = c;
        c = b;
        [b,c,d];
    }
    let e = b;
    [b,c,d,e];
}
