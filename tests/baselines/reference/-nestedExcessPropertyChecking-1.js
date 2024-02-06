//// [tests/cases/compiler/-test/-nestedExcessPropertyChecking-1.ts] ////

//// [-nestedExcessPropertyChecking-1.ts]
// type BaseItem = {
//     id: number;
// }
// type ExtendedItem = BaseItem & {
//     description: string | null
// };

// type BaseValue = {
//     // there are other fields
//     items: BaseItem[];
// }
// type ExtendedValue = BaseValue & {
//     // there are other fields
//     items: ExtendedItem[];
// }

type BaseValue = {
    // there are other fields
    items: {id: number}[];
}
type ExtendedValue = BaseValue & {
    // there are other fields
    items: {id: number, description: string | null }[];
}

declare const x: ExtendedValue;
x.items[0].description; // string | null
x.items[0].id; // number

type ExtendedItem = ExtendedValue['items'][number];
type ExtendedValue2 = {
    items: ExtendedItem[];
}



const TEST_VALUE: ExtendedValue = {
    items: [
        {id: 1, description: null},
        {id: 2, description: 'wigglytubble'},
    ]
};

const t2 = {
    items: [
        {id: 1, description: null},
        {id: 2, description: 'wigglytubble'},
    ]
} satisfies ExtendedValue2;

const t3 = {id: 1, description: null} satisfies ExtendedItem;

//// [-nestedExcessPropertyChecking-1.js]
"use strict";
// type BaseItem = {
//     id: number;
// }
// type ExtendedItem = BaseItem & {
//     description: string | null
// };
x.items[0].description; // string | null
x.items[0].id; // number
var TEST_VALUE = {
    items: [
        { id: 1, description: null },
        { id: 2, description: 'wigglytubble' },
    ]
};
var t2 = {
    items: [
        { id: 1, description: null },
        { id: 2, description: 'wigglytubble' },
    ]
};
var t3 = { id: 1, description: null };
