// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

function t70(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
        [b,c,d]; // expecting [true,true,boolean] 
        let e = b;
        b;c;d;e; // expecting true,true,boolean,true
        [b,c,d,e]; // expecting true,true,boolean,true
    }
}
