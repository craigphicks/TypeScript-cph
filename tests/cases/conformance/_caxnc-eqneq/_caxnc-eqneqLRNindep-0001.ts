// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true


let x: string | number = 1;
let y: string | number = 1;
x;
y;
// Expect: error TS2367: This condition will always return 'false' since the types 'number' and 'string' have no overlap.
if (x===(y="one")){
    x;y;
}
else {
    x;y;
}