// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

// This loop terminates at 1 iteration
function t6(){
    let b = true;
    b;
    while (b){
        b = false;
    }
    b;
}