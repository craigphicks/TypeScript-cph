// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



declare function maybe(): boolean;
function t23(){
    let b = false;
    let c = true;
    let d = true;
    let x = false;


    while (d){
        if (c && maybe()){
            x = true; // gets set on iteration #0 only
            break;
        }
        d = c;
        c = b;
    }
    x; // x should be boolean - if (c && maybe()) "then" branches for each iteration need to "union" joined
    b; // b should be false
    c; // c should be boolean - ditto
    d; // d should be boolean - ditto
}
