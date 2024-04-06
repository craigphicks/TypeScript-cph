// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

function t243(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    d1; // expect 0
    while (true){
        let d2: D = 0;
        // @ts-dev-expect-string "count: 0, type: 0, wtype: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0"
        d1;
        // @ts-dev-expect-string "count: 0, type: 0"
        // @ts-dev-expect-string "count: 1, type: 0"
        d2;
        while (true){
            // @ts-dev-expect-string "count: 0, type: 0, wtype: 0 | 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: 0"
            d2;
            if (d2===0) {
                // @ ts-dev-expect-string "count: 0, type: 0, wtype: 0" -- no, because its getting reset via andIntoSymtab
                // @ts-dev-expect-string "count: 0, type: 0"
                // @ts-dev-expect-string "count: 1, type: 0"
                d2;
                d2=1;
                // @ ts-dev-expect-string "count: 0, type: 1, wtype: 1"
                // @ts-dev-expect-string "count: 0, type: 1"
                // @ts-dev-expect-string "count: 1, type: 1"
                d2;
                break;
            }
            // @ ts-dev-expect-string "count: 0, type: never, wtype: 1 | 2 | 3"
            // @ts-dev-expect-string "count: 0, type: 1 | 2 | 3"
            // @ts-dev-expect-string "count: 1, type: never"
            d2;
        }
        // @ts-dev-expect-string "count: 0, type: 0, wtype: 0 | 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: 0"
        d1;
        // @ ts-dev-expect-string "count: 0, type: 1, wtype: 1"
        // @ts-dev-expect-string "count: 0, type: 1"
        // @ts-dev-expect-string "count: 1, type: 1"
        d2;
        if (d1===0) {
            // @ ts-dev-expect-string "count: 0, type: 0, wtype: 0"
            // @ts-dev-expect-string "count: 0, type: 0"
            // @ts-dev-expect-string "count: 1, type: 0"
            d1;
            d1=1;
            break;
        }
        // @ts-dev-expect-string "count: 0, type: never, wtype: 1 | 2 | 3"
        // @ts-dev-expect-string "count: 1, type: never"
        d1; // expect never
        // @ts-dev-expect-string "count: 0, type: 1, wtype: 1"
        // @ts-dev-expect-string "count: 1, type: never"
        d2; // expect never
    }
    // @ts-dev-expect-string "count: 0, type: 1"
    d1; // expect 1
}
