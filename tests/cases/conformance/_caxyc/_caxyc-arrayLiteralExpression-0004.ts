// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: true
// @strict: true
// @declaration: true
const x = [1,"2"] as [number,string];
// This calls ArrayLiteralExpression with a spread element.
let y = [...x];