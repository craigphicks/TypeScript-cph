// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @mrNarrowDoNotWidenInitalizedFlowType: true
// @mrNarrowDoNotWidenInitalizedFlowType: true

function t3(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
    }
    let e = b;
    b;c;d;e; // expecting true,true,false,true

}
