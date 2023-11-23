//// [tests/cases/compiler/_co/_co-56425.ts] ////

//// [_co-56425.ts]
interface Foo {
    defoo(): never;
}

interface Bar {
    defoo(): void;
}

type Baz = Foo | Bar;

function defooer(baz: Baz) {
    baz.defoo()
    // type = void
    // aka (never | void)

    return baz
    // type = Baz
    // should narrow to Bar
}

//// [_co-56425.js]
function defooer(baz) {
    baz.defoo();
    // type = void
    // aka (never | void)
    return baz;
    // type = Baz
    // should narrow to Bar
}
