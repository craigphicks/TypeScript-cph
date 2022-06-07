// @strict: true
// @declaration: true

declare type Foo1 = { kind: "1" , readonly bar?: { foo:()=>"1"}};
declare type Foo2 = { kind: "2" , foo:()=>"2"};

declare interface Foo { 
    readonly a?: { b: { readonly c: {"1":true, "2": true} }};
    readonly boo?: { readonly bop?: {foo:()=>"1"}};
    readonly bar?: { foo:()=>"2"};
    foo:()=>number[];
}

declare const obj:undefined|Foo;
const is1 = obj?.boo?.bop?.foo();
const is2 = obj?.bar?.foo();
const isn = obj?.foo();
const iso = obj?.a?.b.c;
const isi = is1 && iso;
//const is3 = obj?.bar?.foo()!=="1";

if (is1){
    let x = obj.boo.bop.foo();
}
if (is2){
    let x = obj.bar.foo();
}
if (isn){
    let x = obj.foo();
}


