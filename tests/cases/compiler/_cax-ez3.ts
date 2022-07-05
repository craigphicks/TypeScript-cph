// @strict: true
// @declaration: true
// @exactOptionalPropertyTypes: true

declare type Foo = { 
    foo(x?:number):number[] 
    foo(x?:string,y?:string):string[] 
};
declare type Boo = { 
    foo(x?:bigint):bigint[]  
};
declare const obj: Readonly<Foo> | Readonly<Boo> | undefined;
declare const okobj: Readonly<Foo> | Readonly<Boo>;
const isFoo = obj?.foo();
//let x: Readonly<Foo> | Readonly<Boo> | undefined;
if (isFoo) {
    // @ special
    let x = obj;
    let y = x.foo;
    let z = y();
    console.log(z);
} 
isFoo;



// else {
//     // @ special
//     obj.foo;
// }
