
var tup: [number, number, number] = [1, 2, 3];
var [a,b,c, ...x] = [4,5,6, ...tup];
var [...y] = [...[4,5,6] as const , ...tup];
//type Spr1 = typeof spr1;
