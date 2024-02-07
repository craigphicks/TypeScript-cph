// @strict: true
// @target: es6

declare const y4: number[][] | string[];
declare function f4<T extends {length:number}>(): (x: T) => number;
export const yThen4 = y4.map(f4()); // should not be an error, but is an error
