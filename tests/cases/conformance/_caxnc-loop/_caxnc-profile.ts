// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @generateCpuProfile: ".cpuprofile"
// @diagnostics: true
// @extendedDiagnostics: true


// This loop terminates at 1 iteration
function profile(){
    let b = true;
    b;
    // @ts-dev-expect-string "loopCount:2, invocations:1"
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