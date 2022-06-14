// @strict: true
// @declaration: true
declare const bar: boolean;
//declare const foo: boolean;

declare function invBool(b:true): false;
declare function invBool(b:false): true;
declare function invBool(b:boolean): boolean;
declare function isTrue(b:boolean): b is true;
declare function isBool(b:boolean): b is boolean;
//declare function invBool(b:boolean): boolean;
//const rab1 = !bar; // ? false : true;
const rab2 = bar ? !isTrue(bar) : isTrue(bar);
const foo = rab2;
// if (rab1) {
//     const x = bar; // const x: false
// }
if (foo) {
    const x = bar; // const x: boolean   -- BUG
}
