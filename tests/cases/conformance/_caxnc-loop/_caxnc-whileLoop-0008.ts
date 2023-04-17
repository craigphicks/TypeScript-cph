// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

function t8(){
    //@ts-ignore
    function maybe():boolean {/**/}
    let d = true;
    while (d){
        d = maybe();
        if (d) continue;
        [d]; 
    }
    d;
}
