
/*
Proposal: change in definition for caculating return types, and matching signatures,
for function overloads/intersections
*/


/*
function intersection example
*/
type FF<T> = {
    (predicate: {(x:T):T}, arr: T[]): T[];
}
declare const ffi: FF<string> & FF<number>;

/*
function overload example
*/

type FFO<T1,T2> = {
    (predicate: {(x:T1):T1}, arr: T1[]): T1[];
    (predicate: {(x:T2):T2}, arr: T2[]): T2[];
}
declare const ffo: FFO<string,number>;

type Args<T> = [((x:T)=>T), T[]]


/*
With function intersection and overload, we get errors that should not be there.
A well known problem.
*/
declare const args2: Args<string> | Args<number>;
ffi(args2[0],args2[1]);
ffo(args2[0],args2[1]);


/*
Narrow the args to Args<string> and there is a change:
The function intersection produces an error,
but the function overload does not
*/

declare const args: Args<string>;
ffi(args[0],args[1]); // no error, that's good.
ffo(args[0],args[1]); // no error, that's good.

/*
The proposed new definition for overloads is this (in psuedocode):
Let fol = f1,f2,... be an ordered list of function overload signatures
let args = the call arguments
matching = [];
for each f of fol {
    if weaklyMatches(typeof args, Parameters<f>) matching.push[f];
    if stronglyMatches(typeof args, Parameters<f>) break;
}
returnType = getUnionType(matching.map(f=>ReturnType<f>));
matchingSignatures = matching;

where
- weaklyMatches(argtypes, params) := arityOK(args,params)
  && argtypes.every((argtype,i)=> setIntersection(argtype & param) !== never
- stronglyMatches(argtypes, params) := arityOK(args,params)
  && argtypes.every((argtype,i)=> argtype extends params[i]

The defintion for intersections is the same, but without stronglyMatches...break.
That makes sense because intersections are not ordered, so there can be no "first strong match".

*/


type SetIntersectionNonEmpty<A,P> = (A|P) extends (number|string) ? ((A & P) extends never ? false : true) :
    (A extends ((...args:any[])=>any) ? P extends ((...args:any[])=>any) ?
        true extends ArgsWeaklyMatchParams<Parameters<A>,Parameters<P>> ? true: false : "nevera" : "neverb");

type X = never extends never ? true : false; // never

type ArgsWeaklyMatchParams<A extends any[], P extends any[]> =
P["length"] extends A["length"] ?
A["length"] extends P["length"] ?
A["length"] extends 0 ? true :
SetIntersectionNonEmpty<A[0],P[0]> extends true ?
    (A extends [ A[0], ...infer ATail] ?
    P extends [ P[0], ...infer PTail] ?
    ArgsWeaklyMatchParams<ATail,PTail> : "never1" : "never2") :
    false : "never4" : "never5" ;

type ArgsWeaklyMatchSig<A extends any[], F extends ((...args:any[])=>any)> =
    A extends any[] ? F extends ((...args:any[])=>any) ?
        ArgsWeaklyMatchParams<A,Parameters<F>> : never : never;


type Equal<A,B> = A extends B ? B extends A ? true : never : never;
{
    // check
type T1 = SetIntersectionNonEmpty<number, string>; // false
type T2 = SetIntersectionNonEmpty<string, string>; // true
type T3 = SetIntersectionNonEmpty<string | number, string>; // true
type T4 = SetIntersectionNonEmpty<string, string | string>; // true

type T11 = ArgsWeaklyMatchParams<[number, number], [string, string]>; // false
type T12 = ArgsWeaklyMatchParams<[number|string, number], [string, string]>; // false
type T13 = ArgsWeaklyMatchParams<[number|string, number|string], [string, string]>; // true
type T21 = ArgsWeaklyMatchParams<[(x:number)=>number], [(x:number)=>number]>; // true
type T22 = ArgsWeaklyMatchParams<[((x:number)=>number)|((x:string)=>string)], [(x:number)=>number]>; // true
// type T12x = ArgsWeaklyMatchSig<Args<string>, FF<string>>; // true
// type T13x = ArgsWeaklyMatchParams<string | number, string>; // true
// type T14x = ArgsWeaklyMatchParams<string, string | string>; // true


type T5 = SetIntersectionNonEmpty<Args<string>[0],Args<number>[0]>; // false
type T6 = SetIntersectionNonEmpty<Args<string>[0] | Args<number>[0], Args<number>[0]>;
type T7 = SetIntersectionNonEmpty<Args<string> | Args<number>, Args<string>>;

}

type MatchingSigs<F extends (args0:any,args1:any)=>any, Args extends [any,any]> =
    F extends (args0:any,args1:any)=>any ? Args extends [any,any] ?
        ArgsWeaklyMatchSig<Args,F> extends true ? F : never : never : never;




type MatchingSigsIsect<F extends ((args0:any,args1:any)=>any)[], Args extends [any,any], Result extends any[] = []> =
    F["length"] extends 0 ? Result :
        F extends [F[0], ...infer Tail] ? Tail extends ((args0:any,args1:any)=>any)[] ?
            ArgsWeaklyMatchSig<Args,F[0]> extends true ?
                MatchingSigsIsect<Tail, Args, [F[0],...Result]> :
                MatchingSigsIsect<Tail, Args, Result> : never : never;

// {
//     type TestMatching = MatchingSigsIsect<[FFI<string>,FFI<number>], typeof args2>;
//     /*
//     type TestMatching = [FFI<number>, FFI<string>] // good
//     */
// }
// {
//     type TestMatching = MatchingSigsIsect<[FFI<string>,FFI<number>], Args<string>>;
//     /*
//     type TestMatching = [FFI<number>, FFI<string>] // good
//     */
// }



{




}





