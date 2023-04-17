// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

declare type X = {
    foo: boolean;
};
declare const x:X;

function prop0001(){
    if (x.foo){
        let y = x.foo;
        y;
    }
    else {
        let z = x.foo;
        z;
    }
}