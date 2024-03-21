//// [_caxnc-rhsAssign-0001.ts]
function rhsAssign0001(){
    let a = 0;
    let b = (a = 1);
    a;b; // expecting 1,1
}

function rhsAssign0002(){
    let a = 0;
    let b = (a = 1);
    let c = (b=(a = 2));
    a;b;c; // expecting 2,2,2
}

function rhsAssign0003(){
    let a=1,b=2,c=3,t=0;
    let x = [a,b,c,t=a,a=b,b=c,c=t,t=0] as const;
    x; // expecting [1,2,3,1,2,3,1,0]
}

//// [_caxnc-rhsAssign-0001.js]
"use strict";
function rhsAssign0001() {
    var a = 0;
    var b = (a = 1);
    a;
    b; // expecting 1,1
}
function rhsAssign0002() {
    var a = 0;
    var b = (a = 1);
    var c = (b = (a = 2));
    a;
    b;
    c; // expecting 2,2,2
}
function rhsAssign0003() {
    var a = 1, b = 2, c = 3, t = 0;
    var x = [a, b, c, t = a, a = b, b = c, c = t, t = 0];
    x; // expecting [1,2,3,1,2,3,1,0]
}
