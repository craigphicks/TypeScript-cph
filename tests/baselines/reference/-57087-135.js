//// [tests/cases/compiler/-test3/-57087-135.ts] ////

//// [-57087-135.ts]
interface Garg35A {
    ({x,y}:{x?:1, y?:Garg35B}): "A1"
    ({x,y}:{x?:2, y?:Garg35C}): "A2"
};
interface Garg35B {
    ({x,y}:{x?:2, y?:Garg35C}): "B1"
    ({x,y}:{x:2, y?:Garg35A}): "B2";
};
interface Garg35C {
    ({x,y}:{x:2, y?:Garg35A}): "C1";
    ({x,y}:{x?:1, y?:Garg35B}): "C2"
};

declare const f35a: {
    ({x,y}:{x?:1, y?:Garg35B}): "A1"
    ({x,y}:{x:2, y?:Garg35A}): "B2";
    ({x,y}:{x?:2, y?:Garg35C}): "A2"
}
f35a satisfies Garg35A & Garg35B & Garg35C; // should satisfy

declare const f35b: {
    ({x,y}:{x:2, y?:Garg35A}): "C1";
    ({x,y}:{x?:1, y?:Garg35B}): "C2"
    ({x,y}:{x?:2, y?:Garg35C}): "B1"
}
f35b satisfies typeof f35a & Garg35A & Garg35B & Garg35C; // should satisfy



//// [-57087-135.js]
"use strict";
;
;
;
f35a; // should satisfy
f35b; // should satisfy


//// [-57087-135.d.ts]
interface Garg35A {
    ({ x, y }: {
        x?: 1;
        y?: Garg35B;
    }): "A1";
    ({ x, y }: {
        x?: 2;
        y?: Garg35C;
    }): "A2";
}
interface Garg35B {
    ({ x, y }: {
        x?: 2;
        y?: Garg35C;
    }): "B1";
    ({ x, y }: {
        x: 2;
        y?: Garg35A;
    }): "B2";
}
interface Garg35C {
    ({ x, y }: {
        x: 2;
        y?: Garg35A;
    }): "C1";
    ({ x, y }: {
        x?: 1;
        y?: Garg35B;
    }): "C2";
}
declare const f35a: {
    ({ x, y }: {
        x?: 1;
        y?: Garg35B;
    }): "A1";
    ({ x, y }: {
        x: 2;
        y?: Garg35A;
    }): "B2";
    ({ x, y }: {
        x?: 2;
        y?: Garg35C;
    }): "A2";
};
declare const f35b: {
    ({ x, y }: {
        x: 2;
        y?: Garg35A;
    }): "C1";
    ({ x, y }: {
        x?: 1;
        y?: Garg35B;
    }): "C2";
    ({ x, y }: {
        x?: 2;
        y?: Garg35C;
    }): "B1";
};
