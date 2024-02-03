//// [tests/cases/compiler/-test/-57087-35.ts] ////

//// [-57087-35.ts]
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

declare const f35c: { ({x,y}:{x:1, y:1}): "111"; (arg:Record<string,never>): "221"; ({x}:{x:2}): "221"; ({y}:{y:1}): "221"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f35c satisfies Garg35A & Garg35B; // should satisfy

const t1 = f35c({}); // no error, return 221

declare const f35d: { ({x,y}:{x:1, y:1}): "111"; (arg:Record<string,never>): "221"; /*({x}:{x:2}): "221";*/ ({y}:{y:1}): "221"; ({x,y}:{x:2, y:1}): "221"; ({x,y}:{x:2, y:2}): "222"; }
f35d satisfies Garg35A & Garg35B; // should satisfy

const t2 = f35d({x:2}); // error expected - no overload matches this call
//              ~~~~~


//// [-57087-35.js]
"use strict";
;
;
f35a; // should satisfy
f35b; // should satisfy
f35c; // should satisfy
const t1 = f35c({}); // no error, return 221
f35d; // should satisfy
const t2 = f35d({ x: 2 }); // error expected - no overload matches this call
//              ~~~~~


//// [-57087-35.d.ts]
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
    (arg: Record<string, never>): "221";
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
declare const t1: "221";
declare const f35d: {
    ({ x, y }: {
        x: 1;
        y: 1;
    }): "111";
    (arg: Record<string, never>): "221";
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
declare const t2: never;
