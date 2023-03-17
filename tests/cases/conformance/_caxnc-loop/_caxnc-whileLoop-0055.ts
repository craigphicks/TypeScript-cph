// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;

function t55(){
    let d1 = 0;
    // @ts-dev-expect-string "loopCount:2, invocations:1"
    while (true){
        let d2 = 0;
        // @ts-dev-expect-string "loopCount:2, invocations:3"
        while (true){
            let d3 = 0;
            // @ts-dev-expect-string "loopCount:2, invocations:5"
            while (true){
                let d4 = 0;
                // @ts-dev-expect-string "loopCount:2, invocations:7"
                while (true){
                    d1; d2; d3;
                    if (d4===0) d4=1;
                    else if (d4===1) d4=2;
                    else if (d4===2) d4=3;
                    else if (d4===3) {
                        d4=0; break;
                    }
                }
                d1; d2; d3; d4;
                if (d3===0) d3=1;
                else if (d3===1) d3=2;
                else if (d3===2) d3=3;
                else if (d3===3) {
                    d3=0; break;
                }
            }
            d1; d2; d3;
            if (d2===0) d2=1;
            else if (d2===1) d2=2;
            else if (d2===2) d2=3;
            else if (d2===3) {
                d2=0; break;
            }
        }
        d1; d2;
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
