// @strict: true
// @target: esnext
// @declaration: true

interface Garg35A {
    ({x,y}:{x:1, y:1}): "111"
};
interface Garg35B {
    ({x,y}:{x?:2, y?:1}): "221"
    ({x,y}:{x:2, y?:2}): "222";
};

// declare const f35a: { ({x,y}:{x:1, y:1}): "111"; ({x,y}:{x?:2, y?:1}): "221"; ({x,y}:{x:2, y?:2}): "222"; }
// f35a satisfies Garg35A & Garg35B; // should satisfy

// declare const f35b: { ({x,y}:{x:1, y:1}): "111"; ({x,y}:{x?:2, y?:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
// f35b satisfies Garg35A & Garg35B; // should satisfy

// declare const f35c: { ({x,y}:{x:1, y:1}): "111"; ({}): "221"; ({x}:{x:2}): "221"; ({y}:{y:1}): "221"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
// f35c satisfies Garg35A & Garg35B; // should satisfy

declare const f35d: { ({x,y}:{x:1, y:1}): "111"; /*({}): "221"; ({x}:{x:2}): "221"; ({y}:{y:1}): "221";*/ ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f35d satisfies Garg35A & Garg35B; // should not satisfy
