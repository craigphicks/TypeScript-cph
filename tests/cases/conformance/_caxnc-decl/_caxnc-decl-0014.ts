// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @mrNarrowDoNotWidenInitalizedFlowType: true

declare const b: boolean;
function decl0014(){
    let x;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = [0];
        x;
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = "1";
        x;
    }
    x; // flow not trigger without x here
    x = 2;
    x;    
}
