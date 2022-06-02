// @strict: true
// // @declaration: true
declare type X1Foo = Readonly<{ kind: "foo", foo: string, bug: () => number[] }> ;
declare type X1Bar = Readonly<{ kind: "bar", bar: number, bug: () => number[] }> ; 
declare type X1Baz = Readonly<{ kind: "baz", baz: boolean, bug: () => number[] }>;

declare type X1 = | X1Foo | X1Bar | X1Baz ; 
declare const obj: undefined | X1;
{
    const t = obj?.bug;  // `t` and `obj.bug` are correctly typed, but `obj` is "possibly unedfined"
    let a = t;
    if (t) {
        const u = t;
        a = u;
    }
}
