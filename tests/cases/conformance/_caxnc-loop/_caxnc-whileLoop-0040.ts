// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

function t40(){
    let d1 = 0;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (true){
        d1;
    }
    d1;
}
