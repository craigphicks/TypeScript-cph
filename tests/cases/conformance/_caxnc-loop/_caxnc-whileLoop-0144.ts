// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



function t44(){
    type D = 0 | 1 | 2 | 3 ;
    let d1: D = 0;
    d1; // expect 0
    while (true){
        let d2: D = d1;
        d1; // expect 0 | 1
        d2; // expect 0 | 1
        while (true){
            if (d2===0){
                d2=1;
            }
            else if (d2===1) {
                d2=2; break;
            }
        }
        d1; // expect 0 | 1
        d2; // expect 2
        if (d1===0){
            d1=1;
        }
        else if (d1===1) {
            d1=2; break;
        }
        d1; // expect 1
        d2; // expect 2
    }
    d1; // expect 2
}
