// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true

declare interface FooA {
    foo(b:string): "1",
    foo(b:number): false;
};
declare const obja: undefined | FooA;
declare const arg: string | number;

// checknig isFoo in combo with another condition argIsString
const isFoo = obja?.foo(arg);
const argIsString = typeof arg === "string";
if (isFoo){
    obja;
    arg;
} else if (obja) {
    obja;
    arg;
}
