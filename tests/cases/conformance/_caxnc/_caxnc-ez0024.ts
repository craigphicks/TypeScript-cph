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
if (isFoo===undefined){
    isFoo; // expect undefined
    obja; // expect undefined
    arg; // expect string | number
}
else{
    isFoo; // expect "1" | 0
    obja; // expect FooA
    arg; // expect string | number
    if (typeof isFoo === "string"){
        isFoo; // expect "1"
        obja; // expect FooA
        arg; // expect string
    }
    else{
        isFoo; // expect 0
        obja; // expect FooA
        arg; // expect number
    }
}
