// @strict: true
// @declaration: true

// This loop terminates at 1 iteration
// loop finished due to truthy never, loopCount=1
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