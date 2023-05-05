/* eslint-disable object-literal-surrounding-space */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/type-annotation-spacing */


type X1 = any & unknown; // any
type Y1 = any | unknown; // any

type X3 = any & unknown; // any
type Y3 = any | unknown; // any

type X2 = any & number; // any
type Y2 = any | number; // any

type X4 = unknown & number; // number !!!!
type Y4 = unknown | number; // unknown
