// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


function t4(){
    let b = false;
    let c = true;
    let d = true;
    // @ts-dev-expect-string "loopCount:3, invocations:1"
    while (d){
        d = c;
        c = b;
        b;
        c;
        d;
        let x = d;
    }
    let e = b;
    [b,c,d,e];
}
