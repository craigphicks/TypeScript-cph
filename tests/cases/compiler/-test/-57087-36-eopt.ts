// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: true

interface Garg36A {
    ({x,y}:{x:1, y:1}): "111"
};
interface Garg36B {
    ({x,y}:{x?:2, y?:1}): "221"
    ({x,y}:{x:2, y?:2}): "222";
};


declare const f36d: { ({x,y}:{x:1, y:1}): "111"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f36d satisfies Garg36A & Garg36B; // should satisfy
