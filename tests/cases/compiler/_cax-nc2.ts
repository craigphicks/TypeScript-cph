// @strict: true 
// @declaration: true

declare type Foo1 = { foo1: ()=> number[] }; 
//declare type Foo2 = { foo2: ()=> number }; 
declare const obj1: undefined | Foo1;
//declare const obj2: undefined | Foo2;
//const isFoo1 = obj1?.foo1() ?? false;
//const isFoo2 = obj2?.foo2() ?? "2";
// if (isFoo1){
//     const x1 = obj1.foo1();
// }
if (obj1?.foo1()){
    const x2 = obj1.foo1();
}