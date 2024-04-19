// @strict: true
// @target: esnext

// exported class symbol also works using instanceof (via getExportSymbolOfSymbol in createInstanceofTypeFromConstructorIdentifier)

export class A {
    b = 12;
}
function main() {
    (0 as any as instanceof A).b;
}

