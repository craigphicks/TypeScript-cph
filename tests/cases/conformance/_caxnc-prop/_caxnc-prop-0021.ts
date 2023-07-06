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
        // @ts-dev-debugger
        x.foo;
        // const y = x.foo?.bar;
        // y;
    }
}