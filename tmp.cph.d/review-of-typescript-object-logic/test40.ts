/* eslint-disable object-literal-surrounding-space */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
type A = {a:any, b?:any, x?:any} | number; // 86 U[85,15]
type B = {a?:any, b:any, y?:any} | number; // 88 U[87,15]
type C = {c:any} | number; // 89

type AC = A & C; //90 U[88,89]
type BC = B & C; //96 U

type ABC1 = AC | BC;

type X = number & C;

declare const x:X;

x.c; // 97 U[90,96]

let xx:X = 1; // assigning number is OK. why?
xx = {c:1}; // assigned object is not OK
xx = 1;


let abc1:ABC1 = 1;
abc1 = {c:1,b:1};
abc1 = {c:1,a:1};
abc1 = {c:1,a:1,b:1};



