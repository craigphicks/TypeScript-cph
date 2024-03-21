//// [_caxnc-whileLoop-0008.ts]
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


//// [_caxnc-whileLoop-0008.js]
"use strict";
function t8() {
    //@ts-ignore
    function maybe() { }
    var d = true;
    while (d) {
        d = maybe();
        if (d)
            continue;
        [d];
    }
    d;
}


//// [_caxnc-whileLoop-0008.d.ts]
declare function t8(): void;
