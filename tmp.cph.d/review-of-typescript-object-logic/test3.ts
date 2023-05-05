
type A3 = {x: number, y: number, z: number, p:{x: number, y: number, z: number} }
type B3 = {x: number, y: string, p:{x: number, y: string}}

type I3 = A3 & B3;
type U3 = A3 | B3;
declare const i3:I3;
declare const u3:U3;

{
    let ix = i3.x; // number
    let iy = i3.y; // never
    let iz = i3.z; // number
    let ipx = i3.p.x; // number
    let ipy = i3.p.y; // never
    let ipz = i3.p.z; // number
}
{
    let ux = u3.x; // number
    let uy = u3.y; // string | number
    let uz = u3.z; // error
    let upx = u3.p.x; // number
    let upy = u3.p.y; // string | number
    let upz = u3.p.z; // error
}

// Roughly speaking,
//    ts "intersection" of (non-(array|tuple)) object type object keys is (wrongly) actually union of keys
//    ts "union" of (non-(array|tuple)) object type keys is (wrongly) actually intersection of keys
// However, the end primitve types of existing keys are as expected.