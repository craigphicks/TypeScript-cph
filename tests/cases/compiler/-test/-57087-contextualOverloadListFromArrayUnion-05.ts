// @strict: true
// @target: es6

declare const y5: number[][] | string[];
declare const f5: { (x: number[]): number; (x: string): number;}
export const yThen4 = y5.map(f5);
