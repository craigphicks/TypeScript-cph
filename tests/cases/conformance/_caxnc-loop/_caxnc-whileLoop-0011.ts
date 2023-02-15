// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// this loop never terminates because if always continues
declare function maybe(x:boolean): boolean;
function t11(){
    let d = true;
    // @ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
    while (d){
        d=false;
        if (maybe(d)) continue;
        d=true;
        if (maybe(d)) continue;
        d  =  false;
    }
}
