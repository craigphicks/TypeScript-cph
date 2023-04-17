// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
    foo(b:any): void;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo && argIsString){
    const x = obja.foo(arg);
}
