// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

function t48(){
    type D = 0 | 1 | 2 | 3 | 4 | 5;
    let d1: D;
    let d2: D;
    let d3: D;
    let d4: D;
    d1 = 0;
    while (true){
        d2 = d1;
        while (true){
            d3 = d2;
            while (true){
                d4 = d3;
                while (true){
                    d1; d2; d3;
                    if (d4===0) d4=1;
                    else if (d4===1) d4=2;
                    else if (d4===2) d4=3;
                    else if (d4===3) {
                        d4=0; break;
                    }
                }
                d1; d2; d3; d4;
                if (d3===0) d3=1;
                else if (d3===1) d3=2;
                else if (d3===2) d3=3;
                else if (d3===3) {
                    d3=0; break;
                }
            }
            d1; d2; d3;
            if (d2===0) d2=1;
            else if (d2===1) d2=2;
            else if (d2===2) d2=3;
            else if (d2===3) {
                d2=0; break;
            }
        }
        d1; d2;
        if (d1===0) d1=1;
        else if (d1===1) d1=2;
        else if (d1===2) d1=3;
        else if (d1===3) {
            d1=0;
            break;
        }
    }
    d1;
}
