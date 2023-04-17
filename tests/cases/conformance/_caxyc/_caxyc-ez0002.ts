// @floughEnable: true
// @floughConstraintsEnable: true
// @strict: true
// @declaration: true

declare type Foo = { readonly foo: (x?:number)=>number[] };
declare const obj: Foo | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    obj.foo(); // obj should be of type Foo
}
