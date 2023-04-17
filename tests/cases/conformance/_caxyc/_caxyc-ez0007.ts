// @floughEnable: true
// @floughConstraintsEnable: true
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo){
    const x = obja.foo(arg);
    argIsString;
}
else if (obja) {
    const y = obja.foo(arg);
    argIsString;
}