// @strict: true
// @declaration: true

declare type Foo = { readonly foo: number[] };

declare const obj: Foo | undefined;
const isObj = !!obj;
if (isObj) {
    // @special
    obj.foo;
} else {
    // @special
    obj.foo;
}