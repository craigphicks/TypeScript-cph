// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

function t51(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
    let d1 = 0;
    // @ts-dev-expect-string "loopCount:4, invocations:1"
    while (true){
        // let d2: D = 0;
        // // // @ts-dev-expect-string "????"
        // while (true){
        //     if (d2===0) d2=1;
        //     else if (d2===1) d2=2;
        //     else if (d2===2) d2=3;
        //     else if (d2===3) {
        //         d2=0; break;
        //     }
        // }
        // d2;
        d1;
        if (d1===0) d1=1;
        else if (d1===1) d1=2;
        else if (d1===2) d1=3;
        else if (d1===3) {
            d1=0;
            break;
        }
    }
    d1;
}
