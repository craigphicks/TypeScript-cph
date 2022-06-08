// @strict: true 
// @declaration: true

declare type Foo = { foo: ()=> number[] }; 
declare const obj: undefined | Foo;
const is = obj?.foo();
if (is){
    obj.foo();
}