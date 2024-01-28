// @strict: true
// @target: esnext
// @declaration: true

// test f domain does not support Garg domain (3 omitted from f domain) - should not satisfy

declare const f1: { (x: 1 | 2): 1 | 2; (x: 2): "2" | "3";}

type Garg1 = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f1 satisfies Garg1; // should not satisfy
