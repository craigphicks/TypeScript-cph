type AnyTup = [...any[]];
type FN<Args extends AnyTup,Ret> = (...args:Args)=>Ret;

declare function fproxy<A extends AnyTup,R>(fn:FN<A,R>, ...args: A):R;
declare function f1(s:string):number;

declare function fol1(s:string):string;
declare function fol1(n:number):number;



const x1 = fproxy(f1,"test");
const x2 = fproxy(fproxy, f1,"test");
const x3 = fproxy(fproxy, fproxy, f1,"test");

const t0 = fol1("test");
const t1 = fproxy(fol1,"test"); // Argument of type 'string' is not assignable to parameter of type 'number'.(2345)
//                    ~~~~~~
const t2 = fproxy(fproxy, fol1,"test"); // Argument of type 'string' is not assignable to parameter of type 'number'.(2345)
//                            ~~~~~~
const t3 = fproxy(fproxy, fproxy, fol1,"test");
//                        ~~~~~~
// Argument of type '<A extends AnyTup, R>(fn: FN<A, R>, ...args: A) => R'
// is not assignable to parameter of type 'FN<[{ (s: string): string; (n: number): number; }, string], unknown>'.
//   Types of parameters 'n' and 'args_1' are incompatible.
//     Type 'string' is not assignable to type 'number'.(2345)

// declare function fwrapper<A extends AnyTup, W extends AnyTup, R, Fn extends FN<[...A,...W],R>>(fn:Fn,...args:W): FN<A,R>;

// declare function f2(s:string, n:number):[string,number];

// declare function fol2(s:string,s2:string):[string,string];
// declare function fol2(n:number,n2:number):[number,number];

// const y1 = fwrapper(f2,1);

type TupRem<H, T extends [H, AnyTup], N extends number> = T extends [infer H, ...infer R] ? R : never;

type TupTail<Tup extends AnyTup> = Tup extends [infer H, ...infer R] ? R : never;


declare function fpartial0<A0, AR extends AnyTup, R>(f:(...args:[A0,...AR])=>R,a0:A0): FN<AR,R>;

declare function f2(s:string, n:number):[string,number];

const ftest = fpartial0(f2,"tests");
const inone1 = fpartial0(fpartial0(f2,"test1"),2)();

declare function fol2(s:string,s2:string):[string,string];
declare function fol2(n:number,n2:number):[number,number];

declare const ns: string | number;

const ftests = fpartial0(fol2,ns);
//                            ~~
// Argument of type 'string | number' is not assignable to parameter of type 'number'.
//   Type 'string' is not assignable to type 'number'.ts(2345)
