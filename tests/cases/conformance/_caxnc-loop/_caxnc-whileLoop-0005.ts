// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// this loop never terminates reliably but converges
// loop finished due to type map converged, loopCount=3
declare function maybe(): boolean;
function t5(){
    let b = true;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loop finished due to type map converged, loopCount=3"
    while (d){
        d = c;
        c = b;
        b = maybe();
    }
    let e = b;
    [b,c,d,e];
}
