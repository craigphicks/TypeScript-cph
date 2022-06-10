declare type R = {r:true};
declare type G = {g:true};
declare type B = {b:true};
declare const r:undefined|R;
declare const g:undefined|G;
declare const b:undefined|B;
const x = r || g || b;  // R|G|B|undefined
const y = g || b; // G|B|undefined
const z = y && !x // undefined|boolean
if (z) {
  x; // ? 
} else {
  x; // ? 
}