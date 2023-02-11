// @strict: true
// @declaration: true
const x = [1,"2"] as const;
// This calls ArrayLiteralExpression with a spread element.
let y = [...x];
