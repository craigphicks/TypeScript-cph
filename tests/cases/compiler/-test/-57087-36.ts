// @strict: true
// @noImplicitAny: true
// @strictFunctionTypes: true
// @strictBindCallApply: true
// @strictPropertyInitialization: true
// @noImplicitThis: true
// @alwaysStrict: true
// @noImplicitReturns: true
// @exactOptionalPropertyTypes: true
// @strictNullChecks: true



declare const x: {x?:2, y?:1};
x satisfies { x: 1; y: 1; } | { x: 2; y: 1; } | { x: 2; y: 2; }; // should not satisfy

