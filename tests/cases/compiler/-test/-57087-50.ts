// @strict: true
// @exactOptionalPropertyTypes: true


declare function f1(x:{ a: string } | { b: number }):void;
declare function f2(x:{ a?: string, b?: number }):void;
declare function f3(x:{ a: string, b: number }):void;

type GOR = ((x:{ a: string })=>void) | ((x:{ b: number }) => void);

type GAND = ((x:{ a: string })=>void) & ((x:{ b: number }) => void);


f1 satisfies GOR; // should be true
f2 satisfies GOR; // should be true
f3 satisfies GOR; // should be false


f1 satisfies GAND; // should be true
f2 satisfies GAND; // should be true
f3 satisfies GAND; // should be false

(0 as any as GOR) satisfies GAND; // should be false
(0 as any as GAND) satisfies GOR; // should be true
