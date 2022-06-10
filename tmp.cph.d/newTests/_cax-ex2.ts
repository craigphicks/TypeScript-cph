declare type R = {r:true};
declare type G = {g:true};
declare type B = {b:true};
declare const r:undefined|R;
declare const g:undefined|G;
declare const b:undefined|B;
const x = r && g && b;  
const y = g && b; 
const z = y || !x
if (z) {
  x; // ? 
} else {
  x; // ? 
}