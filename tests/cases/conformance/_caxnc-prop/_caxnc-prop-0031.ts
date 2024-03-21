// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

declare type X = {
    a1?:{a2?:{a3?:1|2}};
};
declare const x:X|null;

function prop0021(){
    if (x?.a1?.a2?.a3){
        x;
        x.a1;
        x.a1.a2;
        x.a1.a2.a3;
    }
}