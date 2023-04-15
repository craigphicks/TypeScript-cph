// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @mrNarrowDoNotWidenInitalizedFlowType: true
// @mrNarrowDoNotWidenInitalizedFlowType: true

function t47(){
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: 0 | 1 | 2 | 999"
    let d1: 0 | 1 | 2 | 999 = 0;
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
