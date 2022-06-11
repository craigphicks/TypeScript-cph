// @strict: true 
// @declaration: true
declare function fn():number;
declare function fb():boolean;
declare const foo: undefined | { fb: typeof fb };
const z = fn() ?? foo?.fb(); 

