
/* eslint-disable object-literal-surrounding-space */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/type-annotation-spacing */

type A = {a:any, b?:any, x?:any} | number; // 86 U[85,15]
type B = {a?:any, b:any, y?:any} | number; // 88 U[87,15]
type C = {c:any}; // 89

type AC = A & C; //90 U[88,89]
type BC = B & C; //96 U

type ABC1 = AC | BC;
const abc1: ABC1 = {a:1,b:1,c:1};
const abc2: ABC1 = 1; // error, c.f below, abcd2=1 IS allowed;

type D = {a?:any, b?:any, z?:any} | number; // 88 U[87,15]

type ABCD1 = ABC1 | D;

const abcd1: ABCD1 = {a:1,b:1,c:1,z:1};
const abcd2: ABCD1 = 1; // no error, c.f. above. abc2=1 IS NOT allowed;
