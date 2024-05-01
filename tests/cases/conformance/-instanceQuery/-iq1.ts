// @strict: true
// @target: esnext

class C {
    c: number;
    constructor(c: number){
        this.c = c;
    }
}

declare const c1: instanceof C;


declare const c2: (instanceof C) & C;
