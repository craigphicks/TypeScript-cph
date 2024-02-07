// @strict: true
// @target: es6

declare const y1: number[][] | string[];
export const yThen1 = y1.map(item => item.length);
