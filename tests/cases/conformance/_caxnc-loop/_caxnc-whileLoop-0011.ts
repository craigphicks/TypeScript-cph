// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// this loop never terminates because if always continues
declare function maybe(x:boolean): boolean;
function t11(){
    let d = true;

    while (d){
        d=false;
        if (maybe(d)) continue;
        d=true;
        if (maybe(d)) continue;
        d  =  false;
    }
}
