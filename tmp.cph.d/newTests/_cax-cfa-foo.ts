type Data = { kind: 'str', payload: string } | { kind: 'num', payload: number };
    
// function gg2(obj: Data) {
//     if (obj.kind === 'str') {
//         let t: string = obj.payload;
//     }
//     else {
//         let t: number = obj.payload;
//     }
// }

function foo({ kind, payload }: Data) {
    if (kind === 'str') {
        let t: string = payload;
            ~
//!!! error TS2322: Type 'string | number' is not assignable to type 'string'.
//!!! error TS2322:   Type 'number' is not assignable to type 'string'.
    }
    else {
        let t: number = payload;
            ~
//!!! error TS2322: Type 'string | number' is not assignable to type 'number'.
//!!! error TS2322:   Type 'string' is not assignable to type 'number'.
    }
}