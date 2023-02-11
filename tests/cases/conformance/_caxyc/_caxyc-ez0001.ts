// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true

declare type Foo = { readonly foo: number[] };

declare const obj: Foo | undefined;
const isObj = !!obj;
if (isObj) {
    obj.foo;
} else {
    obj.foo;
}