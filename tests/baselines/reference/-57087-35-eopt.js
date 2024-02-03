//// [tests/cases/compiler/-test/-57087-35-eopt.ts] ////

//// [-57087-35-eopt.ts]
interface Garg35A {
    ({x,y}:{x:1, y:1}): "111"
};
interface Garg35B {
    ({x,y}:{x?:2, y?:1}): "221"
    ({x,y}:{x:2, y?:2}): "222";
};

declare const f35a: { ({x,y}:{x:1, y:1}): "111"; ({x,y}:{x?:2, y?:1}): "221"; ({x,y}:{x:2, y?:2}): "222"; }
f35a satisfies Garg35A & Garg35B; // should satisfy

declare const f35b: { ({x,y}:{x:1, y:1}): "111"; ({x,y}:{x?:2, y?:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f35b satisfies Garg35A & Garg35B; // should satisfy

declare const f35c: { ({x,y}:{x:1, y:1}): "111"; ({}): "221"; ({x}:{x:2}): "221"; ({y}:{y:1}): "221"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f35c satisfies Garg35A & Garg35B; // should satisfy



//// [-57087-35-eopt.js]
"use strict";
;
;
f35a; // should satisfy
f35b; // should satisfy
f35c; // should satisfy


//// [-57087-35-eopt.d.ts]
interface Garg35A {
    ({ x, y }: {
        x: 1;
        y: 1;
    }): "111";
}
interface Garg35B {
    ({ x, y }: {
        x?: 2;
        y?: 1;
    }): "221";
    ({ x, y }: {
        x: 2;
        y?: 2;
    }): "222";
}
declare const f35a: {
    ({ x, y }: {
        x: 1;
        y: 1;
    }): "111";
    ({ x, y }: {
        x?: 2;
        y?: 1;
    }): "221";
    ({ x, y }: {
        x: 2;
        y?: 2;
    }): "222";
};
declare const f35b: {
    ({ x, y }: {
        x: 1;
        y: 1;
    }): "111";
    ({ x, y }: {
        x?: 2;
        y?: 1;
    }): "221";
    ({ x, y }: {
        x: 2;
        y: 2;
    }): "222";
};
declare const f35c: {
    ({ x, y }: {
        x: 1;
        y: 1;
    }): "111";
    ({}: {}): "221";
    ({ x }: {
        x: 2;
    }): "221";
    ({ y }: {
        y: 1;
    }): "221";
    ({ x, y }: {
        x: 2;
        y: 1;
    }): "221";
    ({ x, y }: {
        x: 2;
        y: 2;
    }): "222";
};
