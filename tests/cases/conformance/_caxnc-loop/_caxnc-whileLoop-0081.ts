// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
// @ floughDoNotWidenInitalizedFlowType: true

declare function maybe(): boolean;
function f81() {
    let x = maybe();
    while (x) {
        x = maybe();
    }
}
