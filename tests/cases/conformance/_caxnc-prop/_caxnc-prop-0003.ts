// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


declare enum X {one="1",two="2"};
declare const x:X;

function prop0003(){
    if (x===X.one){
        x;
    }
    else {
        x;
    }
}