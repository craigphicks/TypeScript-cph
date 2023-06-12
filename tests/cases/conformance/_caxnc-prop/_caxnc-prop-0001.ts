// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    foo: boolean;
};
declare const x:X;

function prop0001(){
    if (x.foo){
        const y = x.foo;
        y;
    }
    else {
        const z = x.foo;
        z;
    }
}