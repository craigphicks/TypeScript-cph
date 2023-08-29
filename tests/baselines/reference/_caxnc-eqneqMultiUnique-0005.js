//// [_caxnc-eqneqMultiUnique-0005.ts]
declare const a1: true|1;
declare const a2: true|1|"2"|"3";
declare const a3: true|1|"2"|"3"|4n|5n;
declare const a4: true|1|"2"|"3"|4n|5n|null|undefined;
declare const b: boolean|number|string|bigint|null|undefined;
if (b===a1)
    b;
else if (b===a2)
    b;
else if (b===a3)
    b;
else if (b===a4)
    b;
else b;
b;

if (b===a1){
    b;
    if (b===a2) {
        b;
        if (b===a3) {
            b;
            if (b===a4) {
                b;
            }
        }
    }
}

//// [_caxnc-eqneqMultiUnique-0005.js]
"use strict";
if (b === a1)
    b;
else if (b === a2)
    b;
else if (b === a3)
    b;
else if (b === a4)
    b;
else
    b;
b;
if (b === a1) {
    b;
    if (b === a2) {
        b;
        if (b === a3) {
            b;
            if (b === a4) {
                b;
            }
        }
    }
}


//// [_caxnc-eqneqMultiUnique-0005.d.ts]
declare const a1: true | 1;
declare const a2: true | 1 | "2" | "3";
declare const a3: true | 1 | "2" | "3" | 4n | 5n;
declare const a4: true | 1 | "2" | "3" | 4n | 5n | null | undefined;
declare const b: boolean | number | string | bigint | null | undefined;
