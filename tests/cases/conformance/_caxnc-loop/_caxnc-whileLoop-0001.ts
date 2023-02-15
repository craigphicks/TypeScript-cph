// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// This loop terminates at 1 iteration
function t1(){
    let b = true;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=1"
    while (b){
        let c = !b;
        c;
        let d = b;
        d;
        b = c;
    }
    let e = b;
    e;
    b;
}