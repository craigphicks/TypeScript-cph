// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// This loop terminates at 0 iteration
// loop finished due to truthy never, loopCount=0
function t2(){
    let b = false;
    b;
    // @ts-dev-expect-string "loop finished due to truthy never, loopCount=0"
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