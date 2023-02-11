//// [_caxyc-fn-0002.ts]
declare interface FooA {
    foo(b:string): "1",
    foo(b:number): undefined;
};
declare const obja: FooA | undefined;
declare const arg: number | string;
if (typeof arg==="string" && obja){
    arg;
    obja;
    const x = obja.foo(arg);
}



//// [_caxyc-fn-0002.js]
"use strict";
;
if (typeof arg === "string" && obja) {
    arg;
    obja;
    var x = obja.foo(arg);
}


//// [_caxyc-fn-0002.d.ts]
declare interface FooA {
    foo(b: string): "1";
    foo(b: number): undefined;
}
declare const obja: FooA | undefined;
declare const arg: number | string;
