// @strict: true
// @declaration: true
declare type X1Foo = Readonly<{ kind: "foo", foo: string, bug: () => number[] }> ;
declare type X1Bar = Readonly<{ kind: "bar", bar: number, bug: () => number[] }> ; 
declare type X1Baz = Readonly<{ kind: "baz", baz: boolean, bug: () => number[] }>;

declare type X1 = | X1Foo | X1Bar | X1Baz ; 
    // Readonly<{ kind: "foo", foo: string, bug: () => number[] }> | 
    // Readonly<{ kind: "bar", bar: number, bug: () => number[] }> | 
    // Readonly<{ kind: "baz", baz: boolean, bug: () => number[] }>;
declare const obj: undefined | X1;
declare const ubool:()=>boolean;
declare function itsFoo(x: X1|undefined): x is X1Foo;
declare function itsBar(x: X1|undefined): x is X1Bar;
declare function itsBaz(x: X1|undefined): x is X1Baz;
declare function itsDefd(x: X1|undefined): x is X1;

{
    const isFoo = obj && obj.kind === "foo";
    const isBar = obj && obj.kind === "bar";
    const isBaz = obj && obj.kind === "baz";
    const isBug = obj?.bug();
    //if (obj) obj.kind = "baz";
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
    if (isFoo) {
        if (isFoo) {
            const t = obj.foo;
        }
        if (isBar) {
            const t = obj.bar;
        }
        if (isBaz) {
            const t = obj.baz;
        }
        if (isBug) {
            const t = obj.bug;
        }
    } else {
        if (isFoo) {
            const t = obj.foo;
        }
        if (isBar) {
            const t = obj.bar;
        }
        if (isBaz) {
            const t = obj.baz;
        }
        if (isBug) {
            const t = obj.bug;
        }
    }
    while (ubool()) { 
        if (isFoo) {
            if (isFoo) {
                const t = obj.foo;
            }
            if (isBar) {
                const t = obj.bar;
            }
            if (isBaz) {
                const t = obj.baz;
            }
            if (isBug) {
                const t = obj.bug;
            }
        } else {
            if (isFoo) {
                const t = obj.foo;
            }
            if (isBar) {
                const t = obj.bar;
            }
            if (isBaz) {
                const t = obj.baz;
            }
            if (isBug) {
                const t = obj.bug;
            }
        }
        // if (obj && obj.kind==="foo") {
        //     if (isFoo) {
        //         const t = obj.foo;
        //     }
        //     if (isBar) {
        //         const t = obj.bar;
        //     }
        //     if (isBaz) {
        //         const t = obj.baz;
        //     }
        //     if (isBug) {
        //         const t = obj.bug;
        //     }
        // } else {
        //     if (isFoo) {
        //         const t = obj.foo;
        //     }
        //     if (isBar) {
        //         const t = obj.bar;
        //     }
        //     if (isBaz) {
        //         const t = obj.baz;
        //     }
        //     if (isBug) {
        //         const t = obj.bug; 
        //     }
        // }
        if (obj && obj.kind==="foo") {
            if (isFoo) {
                const t = obj.foo;
            }
            if (isBar) {
                const t = obj.bar;
            }
            if (isBaz) {
                const t = obj.baz;
            }
            if (isBug) {
                const t = obj.bug;
            }
        }        
        if (!obj || obj.kind!=="foo") {
            if (isFoo) {
                const t = obj.foo;
            }
            if (isBar) {
                const t = obj.bar;
            }
            if (isBaz) {
                const t = obj.baz;
            }
            if (isBug) {
                const t = obj.bug;
            }
        }        
    }
}
