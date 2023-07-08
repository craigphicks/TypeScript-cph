// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    foo?: { bar: boolean };
};
declare const x:X|undefined;

function prop0104(){
    if (!x?.foo?.bar){
        x?.foo?.bar;
    }
}