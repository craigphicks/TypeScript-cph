// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// this loop never terminates because it always continues at `if (b)`
declare function maybe(): boolean;
function t12(){
    let b = true;
    let c = true;
    let d = true;

    while (d){
        d = c;
        c = b;
        if (b) {
            continue;
        }
        b = maybe();
    }
    let e = b;
    [b,c,d,e];
}
