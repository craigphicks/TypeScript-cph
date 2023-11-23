// @strict: true
// @declaration: true
// @target: es5

type ArrayPredISect<S,N> = ((value: string, index: number, array: string[]) => S) & ((value: number, index: number, array: number[]) => N)

interface ArrayPredOverload <S,N> {
    (value: string, index: number, array: string[]): S,
    (value: number, index: number, array: number[]): N
}

type ArrayPredUnion<S,N> = ((value: string|number, index: number, array: (string|number)[]) => S | N)


declare const pisect1:ArrayPredISect<string,number>
declare const pisect2:ArrayPredISect<unknown,unknown>

declare const poload1:ArrayPredOverload<string,number>
declare const poload2:ArrayPredOverload<unknown,unknown>

declare const punion1:ArrayPredUnion<string,number>
declare const punion2:ArrayPredUnion<unknown,unknown>


declare const asn: string[]|number[];
asn.map(pisect1); // 5.2.2. error
asn.map(pisect2);

asn.map(poload1); // 5.2.2. error
asn.map(poload2);

asn.map(punion1);
asn.map(punion2);

declare const asun: (string|number)[];

asun.map(pisect1); // 5.2.2. error
asun.map(pisect2); // 5.2.2. error

asun.map(poload1); // 5.2.2. error
asun.map(poload2); // 5.2.2. error

asun.map(punion1);
asun.map(punion2);

declare const astr: string[];
astr.map(pisect1); // 5.2.2. error
astr.map(pisect2);

astr.map(poload1); // 5.2.2. error
astr.map(poload2);

astr.map(punion1);
astr.map(punion2);
