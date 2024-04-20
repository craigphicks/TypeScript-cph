//// [tests/cases/conformance/-instanceQuery/instanceQuery-0002.ts] ////

//// [instanceQuery-0002.ts]
// exported class symbol also works using instanceof (via getExportSymbolOfSymbol in createInstanceofTypeFromConstructorIdentifier)

export class A {
    b = 12;
}
function main() {
    (0 as any as instanceof A).b;
}



//// [instanceQuery-0002.js]
// exported class symbol also works using instanceof (via getExportSymbolOfSymbol in createInstanceofTypeFromConstructorIdentifier)
export class A {
    b = 12;
}
function main() {
    0..b;
}
