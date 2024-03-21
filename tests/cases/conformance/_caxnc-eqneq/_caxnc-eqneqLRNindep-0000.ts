// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


let x: string | number= 1;
let y: string | number= 1;
if (x===(y="one")){
    x;y;
}
x;y;