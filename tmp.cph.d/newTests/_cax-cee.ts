
// tests/cases/conformance/types/typeParameters/typeArgumentLists/instantiationExpressionErrors.ts
// @strict: true
// @declaration: true

declare let f: { <T>(): T, g<U>(): U };

// Type arguments in member expressions

const a1 = f<number>;  // { (): number; g<U>(): U; }
// const a2 = f.g<number>;  // () => number
// const a3 = f<number>.g;  // <U>() => U
// const a4 = f<number>.g<number>;  // () => number
// const a5 = f['g']<number>;  // () => number
