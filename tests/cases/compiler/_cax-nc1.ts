// @strict: true 
// @declaration: true

declare type Foo1 = { foo1: ()=> number[] }; 
declare const obj1: undefined | Foo1;
const isFoo1 = obj1?.foo1() ?? false;
if (isFoo){
    const x2 = obj1.foo1();
}