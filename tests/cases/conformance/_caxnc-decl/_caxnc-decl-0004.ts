// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true

// @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: string | number"
let x: number|string = 1;
x;

const y: number|string = 1;
y;
