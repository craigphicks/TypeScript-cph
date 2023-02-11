// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
declare const x: 0|1;
declare const y: 0|1;
if (x && y){
    x;
    y;
}
else if (x) {
    x;
    y;
}
