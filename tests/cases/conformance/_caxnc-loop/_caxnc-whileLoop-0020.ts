// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t20(){
    let b = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b){
        if (b) break;
        b = false;
        b;
    }
    b;
}
