// @strict: true
// @target: es6

declare const y3: number[][] | string[];
declare function f3<T extends {length:number}>(): (x: T) => number;
export const yThen3 = y3.map(f3); // should be an error, but is not
