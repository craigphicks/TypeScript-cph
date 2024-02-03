// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: true

interface Garg34A {
    (): "01";
    (x?:1, y?:1): "211"
};
interface Garg34B {
    (): "02";
    (x?:2, y?:2): "222";
    (x?:2, y?:1): "221"
};

declare const f34d: { (): "01"; (x?: 1, y?: 1): "211"; (x: 2, y: 2): "222"; (x: 2, y: 1): "221"; }
f34d satisfies Garg34A & Garg34B; // should not satisfy
