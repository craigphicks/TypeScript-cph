// @strict: true
// @target: esnext
// @declaration: true

declare const f: { (x: 1 | 2): 1 | 2; (x: 3): "2" | "3"; (x: 1 | 2 | 3): 1 | 2 | "2" |"3";}

type Garg = ((x: 1 | 2) => 1 | 2) & ((x: 2 | 3) => "2" | "3");

f satisfies Garg;