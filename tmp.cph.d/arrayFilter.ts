type ArrayFilterFunctionType <ArrayType extends readonly unknown[]> =
    ArrayType extends (infer ET)[] ?
    (predicate: (value: ET, index?: number, array?: ET[]) => unknown, thisArg?: ET[]) => ET[]
    : never ;

function arrayFilterFunction<ArrayType extends readonly unknown[]>(arr: ArrayType): ArrayFilterFunctionType<ArrayType>{
    return arr.filter as ArrayFilterFunctionType<ArrayType>;
}

interface ArrayWithFilter<ArrayType extends readonly unknown[]> {
    filter: ArrayFilterFunctionType<ArrayType>
}

function arrayWithFilter<AT extends unknown[]>(arr: AT){
    return arr as any as Omit<AT, "filter"> & ArrayWithFilter<AT>;
}



//declare const
declare const arr: string[] | number[];
const result1 = arrayFilterFunction(arr)(x=>!!x);
const result2 = arrayWithFilter(arr).filter(x=>!!x);

