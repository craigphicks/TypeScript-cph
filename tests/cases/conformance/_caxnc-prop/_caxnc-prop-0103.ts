// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop103(){
    if (x?.foo){
        x.foo;
    }
}
