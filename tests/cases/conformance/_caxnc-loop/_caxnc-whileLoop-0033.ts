// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @mrNarrowDoNotWidenInitalizedFlowType: true
// @mrNarrowDoNotWidenInitalizedFlowType: true

declare function maybe(): boolean;
function t33(){
    let b1 = true;
    let b2 = true;

    while (b1){
        b1;b2;

        while (b2){
            b1;b2;
            if (maybe()) break;
        }
        b1;b2;
        if (maybe()) break;
    }
    b1;b2;
}
