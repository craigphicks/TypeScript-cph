//// [tests/cases/compiler/_co/_co-onionOfArrays.ts] ////

//// [_co-onionOfArrays.ts]
declare const arrsn : string[]|number[];
declare function strmapol(x:string):string;
declare function strmapol(x:number):number;
//declare function strmap(x:number|string):number|string;

// declare function strmapgen<T extends string|number>(x:T):T;

// //type ID = <I>() => (i: I) => I;

// declare const fstrmapgen: <T extends string|number>()=>(x:T)=>T;

// const fstrmapol = ()=>strmapol;




// arrsn.map(strmapgen); // 5.2.2. no error

// arrsn.map(fstrmapgen()); // 5.2.2. error

arrsn.map(strmapol); // 5.2.2 error

// arrsn.map(fstrmapol()); // 5.2.2. error

//// [_co-onionOfArrays.js]
"use strict";
//declare function strmap(x:number|string):number|string;
// declare function strmapgen<T extends string|number>(x:T):T;
// //type ID = <I>() => (i: I) => I;
// declare const fstrmapgen: <T extends string|number>()=>(x:T)=>T;
// const fstrmapol = ()=>strmapol;
// arrsn.map(strmapgen); // 5.2.2. no error
// arrsn.map(fstrmapgen()); // 5.2.2. error
arrsn.map(strmapol); // 5.2.2 error
// arrsn.map(fstrmapol()); // 5.2.2. error


//// [_co-onionOfArrays.d.ts]
declare const arrsn: string[] | number[];
declare function strmapol(x: string): string;
declare function strmapol(x: number): number;
