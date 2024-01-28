// @strict: true
// @target: esnext
// @declaration: true

// test f range exceeds Garg range - should not satisfy

declare const f2: { (x: 1 | 2): 0 |1 | 2; (x: 3): "2" | "3"; }

type Garg2 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f2 satisfies Garg2; // should not satisfy
