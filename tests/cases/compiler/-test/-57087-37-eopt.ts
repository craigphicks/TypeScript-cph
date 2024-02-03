// @strict: true
// @target: esnext
// @declaration: true
// @exactOptionalPropertyTypes: true

interface Garg37A {
    ({x,y}:{x:1, y:1}): "111"
};
interface Garg37B {
    ({x,y}:{x?:2, y?:1}): "221"
    ({x,y}:{x:2, y?:2}): "222";
};


declare const f37d: { ({x,y}:{x:1, y:1}): "111"; (): "221"; ({x}:{x:2}): "221"; ({y}:{y:1}): "221"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f37d satisfies Garg37A & Garg37B; // should satisfy

f37d({}); // error expected - no overload matches this call
