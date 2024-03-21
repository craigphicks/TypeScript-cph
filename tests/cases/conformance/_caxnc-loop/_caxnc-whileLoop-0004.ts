// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true


function t4(){
    let b = false;
    let c = true;
    let d = true;

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
