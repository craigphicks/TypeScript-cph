// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t32(){
    let b1 = true;
    let b2 = true;
    // @ts-dev-expect-string "loopCount:1, invocations:1"
    while (b1){
        b1;b2;
        // @ts-dev-expect-string "loopCount:1, invocations:2"
        while (b2){
            b1;b2;
        }
        b1;b2;
    }
    b1;b2;
}
