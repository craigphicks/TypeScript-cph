// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    foo?: { bar: boolean };
};
declare const x:X;

function prop0021(){
    if (x.foo?.bar){
        x;
        x.foo;
        x.foo.bar; 
        x.foo?.bar; // The ? should be non-performative, expect { bar: boolean }
        const y = x.foo.bar;
        y;
    }
}