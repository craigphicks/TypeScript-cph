// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

function t56(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
    let d1 = 0;
    d1;

    while (true){
        d1;
        if (d1===0){
            d1 ;
            d1=1;
            d1  ;
        }
        else if (d1===1) {
            d1   ;
            break;
        }
        else if (d1===999){
            d1    ;
        }
    }
    d1;
}
