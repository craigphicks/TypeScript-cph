// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    foo?: { bar: boolean };
};
declare const x:X;

function prop0020(){
    if (x.foo?.bar){
    }
    else {
        x;
        x.foo;
        x.foo?.bar;
        const z = x.foo?.bar;
        z;
    }
}