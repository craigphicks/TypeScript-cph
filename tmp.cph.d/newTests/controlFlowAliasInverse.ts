// @strict: true
// @declaration: true
function f1128(obj?: { kind: "foo", foo: string, bug: () => number[] } | { kind: "bar", bar: number, bug: () => number[] } | { kind: "baz", baz: boolean, bug: () => number[] }) {
    const isFoo = obj && obj.kind === "foo";
    const isBar = obj && obj.kind === "bar";
    const isBaz = obj && obj.kind === "baz";
    const isBug = obj?.bug();
    if (isFoo) {
        // check empty blocks work too
    }
    if (isBar) {
        obj.bar;
    }
    if (isBaz) {
        const xbaz = obj.baz;
    }
    if (isBug) {
        obj;
    }
}
