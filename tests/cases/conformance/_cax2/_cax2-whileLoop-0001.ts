// @strict: true
// @declaration: true

function t1(){
    let b = true;
    b;
    while (b){
        let c = !b;
        c;
        let d = b;
        d;
        b = c;
    }
    let e = b;
    e;
    b;
}