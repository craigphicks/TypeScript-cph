// @strict: true 
// @declaration: true

// Note that Foo1.foo1 is overwritable, but it shouldn't make a difference because the type must be the same.
declare type Foo1 = { foo1: ()=> number[] }; 
declare const obj1: undefined | Foo1;
const isFoo1 = obj1?.foo1() ?? false;
if (isFoo){
    const x2 = obj1.foo1();
}