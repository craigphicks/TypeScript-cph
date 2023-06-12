// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop0002(){
    if (x?.foo?.bar){
        const y = x.foo.bar;
        y;
    }
    else {
        const z = x?.foo?.bar;
        z;
    }
}