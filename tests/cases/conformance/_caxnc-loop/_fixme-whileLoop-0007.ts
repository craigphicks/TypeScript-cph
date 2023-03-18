// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

function t7(){
    let b = true;
    let c = true;
    let d = true;
    while (d){
        d = c;
        c = b;
        b;c;d; // expecting true,true,boolean
        [b,c,d]; // expecting [true,true,boolean] but getting [true,true,true] because ArrayLiteral not processed inside loop
    }
    let e = b;
    b;c;d;e; // expecting true,true,false,true
    [b,c,d,e]; // expecting true,true,false,true

}
