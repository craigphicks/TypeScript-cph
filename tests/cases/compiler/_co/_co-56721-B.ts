type Fn1<P1> = <Q1>() => Q1 extends P1 ? 1 : 2;
type Fn2<P2> = <Q2>() => Q2 extends P2 ? 1 : 2;
type Equals<X, Y> = Fn1<X> extends Fn2<Y> ? true : false;
type A = Equals<{readonly a: 'A'}, {a: 'A'}>;

