//// [_caxnc-flowgraph-0001.ts]
declare function maybe(): boolean;

let x = 1;
const y = 2;

function f1(){
    if (x!==1){
        x = 1
    }
    else {
        x = 3;
    }
}

function f2(){
    if (x!==y){
        x = y
    }
    else{
        x = 3;
    }
}

x = 4;
f1();
f2();


//// [_caxnc-flowgraph-0001.js]
var x = 1;
var y = 2;
function f1() {
    if (x !== 1) {
        x = 1;
    }
    else {
        x = 3;
    }
}
function f2() {
    if (x !== y) {
        x = y;
    }
    else {
        x = 3;
    }
}
x = 4;
f1();
f2();
