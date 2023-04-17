// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

declare function maybe(): boolean;
function t20(){
    let b = true;

    while (b){
        if (b) break;
        b = false;
        b;
    }
    b;
}
