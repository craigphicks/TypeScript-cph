// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true



// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
let x: number|string = 1;
x;
