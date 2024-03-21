// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare function maybe(): boolean;
function t21(){
    let b = true;
    let c = true;
    let d = true;

    while (d){
        d = c;
        c = b;
        if (!b) break;
        b = !b;
        b;
    }
    let e = b;
    [b,c,d,e];
}
