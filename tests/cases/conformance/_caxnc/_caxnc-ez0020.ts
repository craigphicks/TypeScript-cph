// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): 0;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// @ts-expect-error
const isFoo = obja?.foo(arg);

// function f1() {
//     if (isFoo){
//     }
//     else if (isFoo === 0) {
//         obja; // expect FooA
//     }
// }
function f2() {
    if (isFoo){
    }
    else if (isFoo === 0) {
    }
    else {
        isFoo; // expect undefined
    }
}
