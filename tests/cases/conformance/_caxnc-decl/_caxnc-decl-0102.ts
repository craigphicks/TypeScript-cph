// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true



declare const b: boolean;
// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: number"
let x = b?1:1;
x;
