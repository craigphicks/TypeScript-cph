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

// checknig isFoo in combo with another condition argIsString
// @ts-expect-error
const isFoo = obja?.foo(arg);
if (isFoo){
    obja;
    arg;
    isFoo;
}
else if (isFoo === 0) {
    obja;
    arg;
    isFoo;
}
else {
    obja;
    arg;
    //isFoo; currently causing an exception because the case of no logical object is not handled
}
obja;
arg;
isFoo;
