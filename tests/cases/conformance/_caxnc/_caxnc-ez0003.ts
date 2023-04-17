// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

declare type Foo = {
    foo(x?:number):number[]
    foo(x?:string,y?:string):string[]
};
declare type Boo = {
    foo(x?:bigint):bigint[]
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
const isFoo = obj?.foo(); // isFoo should be number[] | bigint[] | undefined, because string[] is shadowed in case of empty input
isFoo; // isFoo should be number[] | bigint[] | undefined

if (isFoo) {
    isFoo; // isFoo should be number[] | bigint[]
    let x = obj; // x should be Readonly<Foo> | Readonly<Boo>
    let y = x.foo; // should be no error
    let z = y(); // z should be number[] | bigint[]
    console.log(z); // again z should be number[] | bigint[]
}
isFoo; // isFoo should be number[] | bigint[] | undefined
