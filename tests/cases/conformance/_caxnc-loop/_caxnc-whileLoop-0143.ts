// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



function t43(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    d1; // expect 0
    while (true){
        let d2: D = 0;
        d1; // expect 0
        d2; // expect 0
        while (true){
            if (d2===0) {
                d2=1; break;
            }
        }
        d1; // expect 0
        d2; // expect 1
        if (d1===0) {
            d1=1;
            break;
        }
        d1; // expect never
        d2; // expect never
    }
    d1; // expect 1
}
