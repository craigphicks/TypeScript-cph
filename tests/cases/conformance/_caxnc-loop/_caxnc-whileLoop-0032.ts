// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

declare function maybe(): boolean;
function t32(){
    let b1 = true;
    let b2 = true;

    while (b1){
        b1;b2;

        while (b2){
            b1;b2;
        }
        b1;b2;
    }
    b1;b2;
}
