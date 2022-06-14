// @strict: true 
// @declaration: true

declare interface FooA { 
    foo(b:string): "1",
    foo(b:number): "2"; 
}; 
declare const obja: undefined | FooA;
const isFoo = obja?.foo("");
if (isFoo){
    const x = obja.foo("");
}
