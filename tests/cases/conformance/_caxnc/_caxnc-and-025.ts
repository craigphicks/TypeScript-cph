// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true 
// @declaration: true
declare const b1: true | false;
declare const b2: true | false;
const ba = (b1 && b2)
  ? [b1,b2]  
  : (b1 || b2) 
    ? (b1) 
      ? [b1,b2] // b2 should be false
      : [b1,b2] // b2 should be true
    : [b1,b2]
