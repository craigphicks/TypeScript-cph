// @strict

declare type NativePerformace = { now(): string };

declare class  Date {
    static now?:()=>string;
    constructor ();
};
declare const nativePerformance:NativePerformace|undefined;

export const timestamp =
        nativePerformance ? () => nativePerformance.now() :
        Date.now ? Date.now :
        () => +(new Date());
