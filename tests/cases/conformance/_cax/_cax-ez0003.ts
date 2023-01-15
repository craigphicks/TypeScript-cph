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
// declare const okobj: Readonly<Foo> | Readonly<Boo>;
const isFoo = obj?.foo();
//let x: Readonly<Foo> | Readonly<Boo> | undefined;
if (isFoo) {
    isFoo;
    let x = obj; // x should be Readonly<Foo> | Readonly<Boo>
    let y = x.foo; // should be no error
    let z = y(); // z should be number[] | string[] | bigint[] - it is not because obtained via checker.ts,resolveCallExpression
    console.log(z); // again z should be number[] | string[] | bigint[] - now it is because it is obtained via getFlowTypeOfReference
} 
isFoo;
