// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



declare function maybe(): boolean;
function t24(){
    let b = true;
    let c = true;
    let d = true;

    while (d){
        c = b;
        d = c;
        b;c;d;
        b = maybe();
        if (!b) break;
        b;c;d;
    }
    let e = b;
    b;c;d;e;
    [b,c,d,e];
}
