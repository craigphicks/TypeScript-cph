// @strict: true
// @declaration: true
// @target: es6

declare const arrsn : string[]|number[];
// declare function strmapol(x:string):string;
// declare function strmapol(x:number):number;
//declare function strmap(x:number|string):number|string;

declare function strmapgen<T>(x:T):T;

arrsn.map(strmapgen); // 5.2.2. no error
