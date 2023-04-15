// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const b: boolean;
function decl0010(){
    let x: number;
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
        x = 0;
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
        x = 1;
    }
    x; // flow not trigger without x here
}
