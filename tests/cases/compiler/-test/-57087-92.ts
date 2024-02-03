// @strict: true
// @ strictBindCallApply: false
// @ useUnknownInCatchVariables: false
// @ noImplicitOverride: true
// @ declaration: true



// @ strict: true
// @ target: esnext
// @ declaration: true
// @ exactOptionalPropertyTypes: false

declare const x: {x?:2, y?:1};
x satisfies { x: 1; y: 1; } | { x: 2; y: 1; } | { x: 2; y: 2; }; // should not satisfy
