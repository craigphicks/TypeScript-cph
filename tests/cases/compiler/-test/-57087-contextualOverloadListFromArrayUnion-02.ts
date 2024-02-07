// @strict: true
// @target: es6

declare const y2: number[][] | string[];
declare function f2<T extends {length:number}>(x: T): number;
export const yThen2 = y2.map(f2);
