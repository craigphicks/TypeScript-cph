// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
declare const b: boolean;
function decl0013(){
    let x;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any"
        x = "1";
    }
    x; // flow not trigger without x here
    let y = x;
    y;
}
