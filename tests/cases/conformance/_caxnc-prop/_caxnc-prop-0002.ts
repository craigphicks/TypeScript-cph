// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @floughDoNotWidenInitalizedFlowType: true
// @floughDoNotWidenInitalizedFlowType: true

declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop0002(){
    if (x?.foo?.bar){
        let y = x.foo.bar;
        y;
    }
    else {
        let z = x?.foo?.bar;
        z;
    }
}