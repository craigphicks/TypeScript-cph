// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t30(){
    let b1 = true;
    let b2 = true;
    // @ts-dev-expect-string "loop finished due to both truthy and falsy never (e.g. break), loopCount=1"
    while (b1){
        // @ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
        while (b2){
        }
    }
}
