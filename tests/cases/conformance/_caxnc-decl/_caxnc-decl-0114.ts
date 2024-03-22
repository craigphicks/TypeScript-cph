// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare const b: boolean;
function decl0014(){
    let x: string | any[];
    if (b) {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any[] | string"
        x = [0];
        x;
    }
    else {
        // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: any[] | string"
        x = "1";
        x;
    }
    x;
    x = 2;
    x;
}
