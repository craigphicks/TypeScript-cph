// @strict: true 
// @declaration: true

declare type X = {getValues:()=>number[]};
declare const x:undefined|X;
const a = x?.getValues();
if (a){
  x;
}