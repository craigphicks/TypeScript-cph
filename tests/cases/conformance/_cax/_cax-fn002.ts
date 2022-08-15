// @strict: true 
// @declaration: true

declare interface FooA { 
    foo(b:string): "1",
    foo(b:number): undefined; 
    foo(b:number|string): "1"|undefined;
}; 
declare const obja: FooA | undefined;
declare const arg: number | string;
if (typeof arg==="string" && obja){
    arg;
    obja;
    //const x = obja.foo(arg);
}

