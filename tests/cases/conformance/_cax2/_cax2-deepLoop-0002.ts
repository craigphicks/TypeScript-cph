// @strict: true
// @declaration: true

declare type X = 1|2|3|4|5|6|7|8|9|0;
declare function maybe(): boolean;
let x1:X = 1;
let x2:X = 1;
let x3:X = 1;
let x4:X = 1;
let x5:X = 1;
let x6:X = 1;
let x7:X = 1;
let x8:X = 1;
let x9:X = 1;

declare function f(x: 0): 1;
declare function f(x: 1): 2;
declare function f(x: 2): 3;
declare function f(x: 3): 4;
declare function f(x: 4): 5;
declare function f(x: 5): 6;
declare function f(x: 6): 7;
declare function f(x: 7): 8;
declare function f(x: 8): 9;
declare function f(x: 9): 0;
x1=1;
while (x1){
    switch (x1){
        //case 0: x1 = 1; break;
        case 1: x1 = 2; break;
        case 2: x1 = 3; break;
        case 3: x1 = 4; break;
        case 4: x1 = 6; break;
        case 5: x1 = 6; break;
        case 6: x1 = 7; break;
        case 7: x1 = 8; break;
        case 8: x1 = 9; break;
        case 9: x1 = 0; break;
    }
    while (maybe()||x1===6) x1=5;
    x1;
    // x2=1
    // while (x2){
    // switch (x2){
    //     // case 0: x2 = 1; break;
    //     case 1: x2 = 2; break;
    //     case 2: x2 = 3; break;
    //     case 3: x2 = 4; break;
    //     case 4: x2 = 5; break;
    //     case 5: x2 = 6; break;
    //     case 6: x2 = 7; break;
    //     case 7: x2 = 8; break;
    //     case 8: x2 = 9; break;
    //     case 9: x2 = 0; break;
    // }
    // x3=1
    // while (x3){
    // switch (x3){
    //     // case 0: x3 = 1; break;
    //     case 1: x3 = 2; break;
    //     case 2: x3 = 3; break;
    //     case 3: x3 = 4; break;
    //     case 4: x3 = 5; break;
    //     case 5: x3 = 6; break;
    //     case 6: x3 = 7; break;
    //     case 7: x3 = 8; break;
    //     case 8: x3 = 9; break;
    //     case 9: x3 = 0; break;
    // }
    // x4=1
    // while (x4){
    // switch (x4){
    //     // case 0: x4 = 1; break;
    //     case 1: x4 = 2; break;
    //     case 2: x4 = 3; break;
    //     case 3: x4 = 4; break;
    //     case 4: x4 = 5; break;
    //     case 5: x4 = 6; break;
    //     case 6: x4 = 7; break;
    //     case 7: x4 = 8; break;
    //     case 8: x4 = 9; break;
    //     case 9: x4 = 0; break;
    // }
    // x5=1
    // while (x5){
    // switch (x5){
    //     // case 0: x5 = 1; break;
    //     case 1: x5 = 2; break;
    //     case 2: x5 = 3; break;
    //     case 3: x5 = 4; break;
    //     case 4: x5 = 5; break;
    //     case 5: x5 = 6; break;
    //     case 6: x5 = 7; break;
    //     case 7: x5 = 8; break;
    //     case 8: x5 = 9; break;
    //     case 9: x5 = 0; break;
    // }
    // x6=1
    // while (x6){
    // switch (x6){
    //     // case 0: x6 = 1; break;
    //     case 1: x6 = 2; break;
    //     case 2: x6 = 3; break;
    //     case 3: x6 = 4; break;
    //     case 4: x6 = 5; break;
    //     case 5: x6 = 6; break;
    //     case 6: x6 = 7; break;
    //     case 7: x6 = 8; break;
    //     case 8: x6 = 9; break;
    //     case 9: x6 = 0; break;
    // }
    // x7=1
    // while (x7){
    // switch (x7){
    //     // case 0: x7 = 1; break;
    //     case 1: x7 = 2; break;
    //     case 2: x7 = 3; break;
    //     case 3: x7 = 4; break;
    //     case 4: x7 = 5; break;
    //     case 5: x7 = 6; break;
    //     case 6: x7 = 7; break;
    //     case 7: x7 = 8; break;
    //     case 8: x7 = 9; break;
    //     case 9: x7 = 0; break;
    // }
    // x8=1
    // while (x8){
    // switch (x8){
    //     // case 0: x8 = 1; break;
    //     case 1: x8 = 2; break;
    //     case 2: x8 = 3; break;
    //     case 3: x8 = 4; break;
    //     case 4: x8 = 5; break;
    //     case 5: x8 = 6; break;
    //     case 6: x8 = 7; break;
    //     case 7: x8 = 8; break;
    //     case 8: x8 = 9; break;
    //     case 9: x8 = 0; break;
    // }
    x9=1
    while (x9){
    switch (x9){
        // case 0: x9 = 1; break;
        case 1: x9 = 2; break;
        case 2: x9 = 3; break;
        case 3: x9 = 4; break;
        case 4: x9 = 5; break;
        case 5: x9 = 6; break;
        case 6: x9 = 7; break;
        case 7: x9 = 8; break;
        case 8: x9 = 9; break;
        //case 9: x9 = 0; break;
    }
    x1=5;
    x1;
}}//}}}}}}}
