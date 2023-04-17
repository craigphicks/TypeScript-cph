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
if (isFoo){
    const x = obja.foo(arg);
    x; // expect "1"
    arg; // expect string
    argIsString; // expect true
}
else if (obja) {
    const y = obja.foo(arg); // resolveCall has it's own logic, separate from flow
    y; // expect  "1" | undefined
    arg; // expect string | number
    argIsString; // expect boolean
}