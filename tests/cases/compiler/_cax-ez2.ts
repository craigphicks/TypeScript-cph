// @strict: true
// @declaration: true

declare type Foo = { readonly foo: ()=>number[] };
declare const obj: Foo | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    // @special
    obj.foo();
} 
// else {
//     // @ special
//     obj.foo;
// }