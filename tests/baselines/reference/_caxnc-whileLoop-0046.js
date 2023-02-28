//// [_caxnc-whileLoop-0046.ts]
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;

function t46(){
    type D = 0 | 1 | 2 | 3 | 4 | 5;
    let d1: D = 0;
    // @ ts-dev-expect-string "loopCount:4, invocations:1"
    while (true){
        let d2: D = d1;
        // @ts-dev-expect-string "loopCount:7, invocations:5"
        while (true){
            let d3: D = d2;
            // @ts-dev-expect-string "loopCount:10, invocations:12"
            while (true){
                let d4: D = d3;
                // @ts-dev-expect-string "loopCount:13, invocations:22"
                while (true){
                    d1; d2; d3; d4;
                    if (d4===3) {
                        d1; d2; d3; d4;
                        d4=0; break;
                    }
                    else if (d4===2) {
                        d1; d2; d3; d4;
                        d4=3;
                    }
                    else if (d4===1){
                        d1; d2; d3; d4;
                        d4=2;
                    }
                    else if (d4===0){
                        d1; d2; d3; d4;
                        d4=1;
                    }
                }
                d1; d2; d3; d4;
                if (d3===0) {
                    d1; d2; d3; d4;
                    d3=1;
                }
                else if (d3===1) {
                    d1; d2; d3; d4;
                    d3=2;
                }
                else if (d3===2) {
                    d1; d2; d3; d4;
                    d3=3;
                }
                else if (d3===3) {
                    d1; d2; d3; d4;
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


//// [_caxnc-whileLoop-0046.js]
"use strict";
// declare function next(x:0): 1;
// declare function next(x:1): 2;
// declare function next(x:2): 3;
// declare function next(x:3): 0;
// declare function next(d:D): D;
function t46() {
    var d1 = 0;
    // @ ts-dev-expect-string "loopCount:4, invocations:1"
    while (true) {
        var d2 = d1;
        // @ts-dev-expect-string "loopCount:7, invocations:5"
        while (true) {
            var d3 = d2;
            // @ts-dev-expect-string "loopCount:10, invocations:12"
            while (true) {
                var d4 = d3;
                // @ts-dev-expect-string "loopCount:13, invocations:22"
                while (true) {
                    d1;
                    d2;
                    d3;
                    d4;
                    if (d4 === 3) {
                        d1;
                        d2;
                        d3;
                        d4;
                        d4 = 0;
                        break;
                    }
                    else if (d4 === 2) {
                        d1;
                        d2;
                        d3;
                        d4;
                        d4 = 3;
                    }
                    else if (d4 === 1) {
                        d1;
                        d2;
                        d3;
                        d4;
                        d4 = 2;
                    }
                    else if (d4 === 0) {
                        d1;
                        d2;
                        d3;
                        d4;
                        d4 = 1;
                    }
                }
                d1;
                d2;
                d3;
                d4;
                if (d3 === 0) {
                    d1;
                    d2;
                    d3;
                    d4;
                    d3 = 1;
                }
                else if (d3 === 1) {
                    d1;
                    d2;
                    d3;
                    d4;
                    d3 = 2;
                }
                else if (d3 === 2) {
                    d1;
                    d2;
                    d3;
                    d4;
                    d3 = 3;
                }
                else if (d3 === 3) {
                    d1;
                    d2;
                    d3;
                    d4;
                    d3 = 0;
                    break;
                }
            }
            d1;
            d2;
            d3;
            if (d2 === 0)
                d2 = 1;
            else if (d2 === 1)
                d2 = 2;
            else if (d2 === 2)
                d2 = 3;
            else if (d2 === 3) {
                d2 = 0;
                break;
            }
        }
        d1;
        d2;
        if (d1 === 0)
            d1 = 1;
        else if (d1 === 1)
            d1 = 2;
        else if (d1 === 2)
            d1 = 3;
        else if (d1 === 3) {
            d1 = 0;
            break;
        }
    }
    d1;
}


//// [_caxnc-whileLoop-0046.d.ts]
declare function t46(): void;
