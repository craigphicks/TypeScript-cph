// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: false

interface Garg31A {
    (): "01";
    (x:1, y:1): "211"
};
declare const g31A: Garg31A;

interface Garg31B {
    (): "02";
    (x:2, y:2): "222";
    (x:2, y:1): "221"
};
declare const g31B: Garg31B;

declare const f31a: {
    (): "01";
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
    (x?:any,y?:any): never
};
f31a satisfies Garg31A & Garg31B; // should satisfy

declare const f31b: {
    (): "01";
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "221" /*should cause "f31b satisfies" to error */;
    (x: 2, y: 1): "221";
    (x?:any,y?:any): never
};
f31b satisfies Garg31A & Garg31B; // should not satisfy

declare const f31c: {
    (): "01"; (x: 1, y: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
    (x: 1, y: 2): "221" /*should cause "f31c satisfies" to error */;
    (x?:any,y?:any): never
};
f31c satisfies Garg31A & Garg31B; // should not satisfy

declare const f31d:{
    (): "01";
    (x?: 1, y?: 1): "211"; /*should cause "f31d satisfies" to error */
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
    (x?:any,y?:any): never;
};
f31d satisfies Garg31A & Garg31B; // should not satisfy

declare const f31f: {
    //(): "01"; // missing domain support cannot be detected at compiler time with final never
    (x: 1, y: 1): "211";
    (x: 2, y: 2): "222";
    (x: 2, y: 1): "221";
    (x?:any,y?:any): never // should correspond to runtime throw or error activated for input ()
}
f31f satisfies Garg31A & Garg31B; // expected to satisfy


/*
* Scenario:
* (1) overloads are fully expanded from Garg31A and Garg31B, no final never.
* (2) implementation return types entered directly. Note: Extra verbosity in implementation to satisfy the compiler (* here)
* Number of overloads could impact compile time, makes life harder for downstream users of the function
*/

// function f31gImpl(): "01"; // G31A fully expanded
// function f31gImpl(x:1, y:1): "211" // G31A fully expanded
// function f31gImpl(): "02"; // G31B fully expanded, compiler complains in implementation (*)
// function f31gImpl(x:2, y:2): "222"; // G31B fully expanded
// function f31gImpl(x:2, y:1): "221" // G31B fully expanded
// function f31gImpl(x?:1|2,y?:1|2){
//     if (!x && !y) return "01";
//     if (x==1) return "211";
//     if (x===2) {
//         if (y==1) return "221"
//         else return "222";
//     }
//     // (*) have to add this extra line to satisfy the compiler
//     if (!x && !y) return "02";

//     //throw "unexpected error"; We can theoretically remove this because we used the fully expanded domain support
//     // and none of Garg31A, Garg31B have never as an overload return type
// }



/*
* Scenario:
* (1) overload with final never (risk of missing domain support not detected at compile time)
* (2) implementation calling underlying functions g31A and g31B without compile errors
*/
// function f31aImpl1(): "01";
// function f31aImpl1(x: 1, y: 1): "211";
// function f31aImpl1(x: 2, y: 2): "222";
// function f31aImpl1(x: 2, y: 1): "221";
// function f31aImpl1(x?:any,y?:any): never
// function f31aImpl1(x?:1|2,y?:1|2){
//     if (!x && !y) return g31A();
//     if (x===1 && y===1)return g31A(x,y);
//     if (x===2) {
//         if (y==1) return g31B(x,y)
//         else if (y===2) return g31B(x,y);
//     }
//     throw "unexpected error";
// }
// f31aImpl1 satisfies Garg31A & Garg31B; // should satisfy

/*
* Scenario:
* (1) overloads with final never (risk of missing domain support not detected at compile time)
* (2) implementation return types entered directly. Note: Slightly easier to implement than f31aImpl1
*/
// function f31aImpl2(): "01";
// function f31aImpl2(x: 1, y: 1): "211";
// function f31aImpl2(x: 2, y: 2): "222";
// function f31aImpl2(x: 2, y: 1): "221";
// function f31aImpl2(x?:any,y?:any): never
// function f31aImpl2(x?:1|2,y?:1|2){
//     if (!x && !y) return "01";
//     if (x==1) return "211";
//     if (x===2) {
//         if (y==1) return "221"
//         else return "222";
//     }
//     throw "unexpected error";
// }
// f31aImpl2 satisfies Garg31A & Garg31B; // should satisfy


/*
* Scenario:
* (1) overloads with final never (risk of missing domain support not detected at compile time)
*     - the missing domain support is not detected at comple, but at runtime
* (2) implementation return types entered directly. Note: Slightly easier to implement than f31aImpl1
*/
function f31fImpl(x: 1, y: 1): "211";
function f31fImpl(x: 2, y: 2): "222";
function f31fImpl(x: 2, y: 1): "221";
function f31fImpl(x?:any,y?:any): never // should correspond to runtime throw or error activated for input !x && !y
function f31fImpl(x?:1|2,y?:1|2){
    if (x==1) return "211";
    if (x===2) {
        if (y==1) return "221"
        else return "222";
    }
    throw "unexpected error"; // case !x && !y reaches here
}
f31fImpl satisfies Garg31A & Garg31B; // expected to satisfy, runtime throw "unexpected error" for input !x && !y





