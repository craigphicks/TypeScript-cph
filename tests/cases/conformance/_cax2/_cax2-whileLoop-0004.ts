// @strict: true
// @declaration: true

// loop finished due to truthy never, loopCount=2
function t4(){
    let b = false;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;
        c;
        d;
        let x = d;
    }
    let e = b;
    [b,c,d,e];
}
