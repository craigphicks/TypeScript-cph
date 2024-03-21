// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

declare type Boo = {
    foo():bigint[]
};
declare const obj: Readonly<Boo> | undefined;
const isFoo = obj?.foo();
if (isFoo) {
    // check merge after end if scope
}
isFoo; // isFoo should be bigint[] | undefined
