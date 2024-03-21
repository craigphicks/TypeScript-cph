// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

/**
 * Mix object and non-object function root types.
 * Checker type of v outside of the if statement includes undefined when v is const.
 */

type Foo = () => number[];
type ObjFoo = { foo: () => string[]; }
declare const b: boolean;
const v = b ? (undefined as any as Foo) : (undefined as any as (ObjFoo|undefined))?.foo;
if (v) {
    v();
}
v;
