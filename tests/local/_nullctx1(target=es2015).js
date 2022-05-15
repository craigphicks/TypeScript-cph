//// [_nullctx1.ts]
class A {
    #field = 1;
    constructor() {
        [this.#field, [this.#field]] = [1, [2]];
    }
}


//// [_nullctx1.js]
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _A_field;
class A {
    constructor() {
        var _a, _b;
        _A_field.set(this, 1);
        _a = this, _b = this, [({ set value(_c) { __classPrivateFieldSet(_a, _A_field, _c, "f"); } }).value, [({ set value(_c) { __classPrivateFieldSet(_b, _A_field, _c, "f"); } }).value]] = [1, [2]];
    }
}
_A_field = new WeakMap();
