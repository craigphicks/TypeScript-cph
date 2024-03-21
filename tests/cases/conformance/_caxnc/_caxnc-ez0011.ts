// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

/**
 * Mix object and non-object function root types
 */

type Foo = () => number[];
type ObjFoo = { foo: () => string[]; }
declare const b: boolean;
let v = b ? (undefined as any as Foo) : (undefined as any as ObjFoo).foo;
v();
