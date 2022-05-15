// @target: es2015

class A {
    #field = 1;
    constructor() {
        [this.#field, [this.#field]] = [1, [2]];
    }
}
