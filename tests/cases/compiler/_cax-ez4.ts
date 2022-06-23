// @strict: true
// @declaration: true

declare interface Foo { 
    foo(x:Foo):Foo;
    foo(x:undefined):undefined; 
};

declare const obj: Readonly<Foo> | undefined;
const isFoo = obj?.foo(obj);
if (isFoo) {
    // @special
    obj; //.foo(obj);
} 
// else {
//     // @ special
//     obj.foo(obj);
// }