// @strict: true
// @declaration: true

function t1(){
    let b = true;
    if (b){
        let c1 = !b;
        let d1 = b;
    } else {
        if (b) {
            let c2 = !b;
        }
    }
    if (b){
        let d2 = b;
    }
    let e = b;
}