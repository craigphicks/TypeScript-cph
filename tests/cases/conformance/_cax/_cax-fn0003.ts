// @strict: true 
// @declaration: true

declare interface FooA { 
    foo(b:string): "1",
    foo(b:number): undefined; 
    foo(b:number|string): "1"|undefined;
}; 
declare const obja: undefined | FooA;
declare const arg: string | number;
if (obja?.foo("") /* && typeof arg === "string" */){
    const x = obja.foo(arg); // x should be "1"
}
else if (obja) {
    const x = obja.foo(arg); // x should be undefined
}
