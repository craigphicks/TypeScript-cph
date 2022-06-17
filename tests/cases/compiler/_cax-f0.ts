// @strict: true 
// @declaration: true

declare interface FooA { 
    foo(b:string): "1",
    foo(b:number): undefined; 
    foo(b:number|string): "1"|undefined;
}; 
declare const obja: undefined | FooA;
declare const arg: string | number;

// const isFoo = obja?.foo("");
// const argIsString = typeof arg === "string";
if (obja?.foo("") && typeof arg === "string"){
    const x = obja.foo(arg);
}
if (!(obja?.foo(""))){
    const x = obja.foo(arg);
}


// declare interface FooA { 
//     foo(b:FooA): FooA,
//     foo(b:undefined): undefined; 
// };
// declare const obja: undefined | FooA;
// const isFoo = obja?.foo(obja);
// if (isFoo){
//     const x = obja.foo(obja);
// }
