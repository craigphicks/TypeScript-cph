// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): false;
};
declare const obja: undefined | FooA;
declare const arg: string | number;
// @ts-expect-error
const isFoo = obja?.foo(arg);
if (isFoo){
    //
}
else if (isFoo === false) {
}
else {
    isFoo; // expect undefined (currently never)
}