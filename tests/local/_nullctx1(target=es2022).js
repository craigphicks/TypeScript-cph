//// [_nullctx1.ts]
class A {
    #field = 1;
    constructor() {
        [this.#field, [this.#field]] = [1, [2]];
    }
}


//// [_nullctx1.js]
class A {
    #field = 1;
    constructor() {
        [this.#field, [this.#field]] = [1, [2]];
    }
}
