// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true 
// @declaration: true
declare const b1: true | false;
const ba = b1 ? b1 : true; 

// Expecting:
// >ba : true
// >b1 ? b1 : true : true
// >b1 : boolean
// >b1 : true
// >true : true