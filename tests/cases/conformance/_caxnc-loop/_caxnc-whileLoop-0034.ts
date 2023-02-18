// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t34(){
    let b1 = true;
    let b2 = true;
    loop1:
    // @ ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
    while (b1){
        b1;b2;
        // @ ts-dev-expect-string "loop finished due to type map converged, loopCount=1"
        while (b2){
            b1;b2;
            if (maybe()) {
                b2=false;
                break ;//loop1;
            }
        }
        b1;b2;
        //if (maybe()) break;
    }
    b1;b2;
}
