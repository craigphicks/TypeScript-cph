// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


let x: string | number | bigint = 1;
let y: string | number | bigint = 1;
x;
y;
// Oddly, this is not an error.
if (x===(y="one")){
    x;y;
}
else {
    x;y;
}