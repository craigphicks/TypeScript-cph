// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

type Foo = (x?:number) => number[];
//type Boo = (x?:bigint) => bigint[]
declare const f: Foo;
const v = f();
