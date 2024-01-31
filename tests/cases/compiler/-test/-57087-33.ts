// @strict: true
// @target: esnext
// @declaration: true

interface Garg33A {
    (): "01";
    (x?:1, y?:1): "211"
};
interface Garg33B {
    (): "02";
    (x?:2, y?:2): "222";
    (x?:2, y?:1): "221"
};

declare const f33a: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; }
f33a satisfies Garg33A & Garg33B; // should satisfy

declare const f33b: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "221" /*should fail match*/; (x: 2, y: 1): "221"; }
f33b satisfies Garg33A & Garg33B; // should not satisfy

declare const f33c: { (): "01"; (x: 1, y: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; (x: 1, y: 2): "221" /*should fail match*/; }
f33c satisfies Garg33A & Garg33B; // should not satisfy

declare const f33d: { (): "01"; (x?: 1, y?: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; }
f33d satisfies Garg33A & Garg33B; // should satisfy
