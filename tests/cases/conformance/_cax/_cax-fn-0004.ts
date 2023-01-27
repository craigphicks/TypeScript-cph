// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1";
}
declare interface FooB {
    foo(b:number): undefined;
};
declare const obja: undefined | FooA | FooB;
declare const arg: string | number;
if (obja?.foo(arg)){
    obja; // should be FooA
    arg; // should be string
    const x = obja.foo(arg); // x should be "1"
}
else if (obja) {
    arg; // should be number
    const x = obja.foo(arg); // x should be undefined
} else {
    obja; // should be undefined
}
