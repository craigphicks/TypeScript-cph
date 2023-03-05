// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true
declare const b: boolean;
function decl0012(){
    let x: any;
    if (b) {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: any"
        x = [0];
    }
    else {
        // @ts-dev-expect-string "count: 0, actualDeclaredTsType: any"
        x = "1";
    }
    x; // flow not trigger without x here
}
