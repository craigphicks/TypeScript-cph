// @strict: true
// @declaration: true

interface Foo {
    foo: ()=>number[];
}
declare const obj: undefined | Foo;
const is = obj?.foo();
if (is) {
    let x = obj.foo();
}