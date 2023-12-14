type Fn0<P0> = <Q0>() => Q0 extends P0 ? 1 : 2;
///////////////////////////////////////////////
type Equals<X, Y> = Fn0<X> extends Fn0<Y> ? true : false;
type A = Equals<{readonly a: 'A'}, {a: 'A'}>;
