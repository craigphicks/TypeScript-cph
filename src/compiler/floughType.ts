namespace ts {

    const uniqueNeverType: FloughType = { nobj:{} } as const;

    export type RefTypesType = FloughType;

    export interface FloughType {};

    // leave the names the same in RefTypesType while changing the names in FloughTypeIF
    export interface FloughTypeModule {
        /**
         * Interface copied from RefTypesTypeModule
         */

        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): FloughType ;
        cloneRefTypesType(t: Readonly<FloughType>): FloughType;
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: FloughType}): FloughType ;
        mergeToRefTypesType({source,target}: { source: Readonly<FloughType>, target: FloughType}): void ; // DEPRECATED
        unionOfRefTypesType(types: Readonly<FloughType[]>): FloughType ;
        /**
         * This is a dummy function
         * @param args
         */
        NOTINSERVICE_intersectionOfRefTypesType(...args: Readonly<FloughType>[]): FloughType ;
        isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        NOTINSERVICE_subtractFromType(subtrahend: Readonly<FloughType>, minuend: Readonly<FloughType>, /* errorOnMissing = false */): FloughType ;
        isNeverType(type: Readonly<FloughType>): boolean ;
        isAnyType(type: Readonly<FloughType>): boolean ;
        isUnknownType(type: Readonly<FloughType>): boolean ;
        isAnyOrUnknownType(type: Readonly<FloughType>): boolean ;
        forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<FloughType>, f: F): void ;
        equalRefTypesTypes(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): void;
        intersectionsAndDifferencesForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): IntersectionsAndDifferencesForEqualityCompareReturnType;
        dbgRefTypesTypeToStrings(type: Readonly<FloughType>): string[];
        // end of interface copied from RefTypesTypeModule

        /**
         * Prefered interface for FloughType
         * @param ft
         */
        createFromTsType(tstype: Readonly<Type>, logicalObject?: Readonly<FloughLogicalObjectIF> | undefined): FloughType;
        createFromTsTypes(tstypes: Readonly<Type[]>, logicalObject?: Readonly<FloughLogicalObjectIF> | undefined): FloughType;
        unionWithTsTypeMutate(tstype: Readonly<Type>, ft: FloughType): FloughType;
        cloneType(ft: Readonly<FloughType>): FloughType;
        createNeverType(): FloughType;
        getNeverType(): Readonly<FloughType>;
        createNumberType(): Readonly<FloughType>;
        createUndefinedType(): Readonly<FloughType>;
        createTrueType(): Readonly<FloughType>;
        createFalseType(): Readonly<FloughType>;
        createBooleanType(): Readonly<FloughType>;
        createLiteralStringType(s: string): Readonly<FloughType>;
        //intersectionWithFloughTypeSpecialMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        unionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        //differenceWithFloughTypeMutate(subtrahend: Readonly<FloughType>, minuend: FloughType): FloughType;

        getTsTypesFromFloughType(ft: Readonly<FloughType>): Type[];
        getTsTypeFromFloughType(type: Readonly<FloughType>, forNodeToTypeMap?: boolean): Type ;
        /**
         * The intersection of the nobj parts is exact.
         * The value of the logicalObject part is unassigned if either ft1.logicalObject or ft2.logicalObject is unassigned,
         * otherwise is the value of ft2.logicalObject.
         * @param ft1
         * @param ft2
         */
        intersectionWithFloughTypeSpecial(a: Readonly<FloughType>,b: Readonly<FloughType>): FloughType;
        hasLogicalObject(ft: Readonly<FloughType>): boolean;
        getLogicalObject(ft: Readonly<FloughType>): FloughLogicalObjectIF | undefined;
        createTypeFromLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF> | undefined, nonObj?: Readonly<FloughType> | undefined): FloughType;
        setLogicalObjectMutate(logicalObject: Readonly<FloughLogicalObjectIF>, ft: FloughType): void;
        widenNobjTypeByEffectiveDeclaredNobjType(ftNobj: Readonly<FloughType>, effectiveDeclaredNobjType: Readonly<FloughType>): FloughType;
        getLiteralNumberTypes(ft: Readonly<FloughType>): LiteralType[] | undefined;
        getLiteralStringTypes(ft: Readonly<FloughType>): LiteralType[] | undefined;
        hasNumberType(ft: Readonly<FloughType>, intrinsicNumberTypeOnly?: true): boolean;
        hasStringType(ft: Readonly<FloughType>, intrinsicStringTypeOnly?: true): boolean;
        hasUndefinedType(ft: Readonly<FloughType>): boolean;
        isEqualToUndefinedType(ft: Readonly<FloughType>): boolean;
        hasUndefinedOrNullType(ft: Readonly<FloughType>): boolean;
        getObjectUsableAccessKeys(type: Readonly<FloughType>): ObjectUsableAccessKeys;
        splitLogicalObject(ft: Readonly<FloughType>): { logicalObject?: FloughLogicalObjectIF | undefined, remaining: FloughType };
        removeUndefinedNullMutate(ft: FloughType): void;
        addUndefinedTypeMutate(ft: FloughType): void;
        intersectionWithUndefinedNull(ft: Readonly<FloughType>): FloughType | undefined;

        dbgFloughTypeToStrings(type: Readonly<FloughType>): string[];
        dbgFloughTypeToString(type: Readonly<FloughType>): string;

    }

    export type PartitionForEqualityCompareItem = & { both?: FloughType, left?: FloughType, right?: FloughType, true?: boolean, false?: boolean };
    export const floughTypeModule: FloughTypeModule = {
        /**
         * Interface copied from RefTypesTypeModule
         */
        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): FloughType {
            if (tstype === undefined) return createNeverType();
            if (Array.isArray(tstype)) {
                let ft = createNeverType();
                tstype.forEach((t,_i)=>{
                    ft = unionWithTsTypeMutate(t,ft);
                });
                return ft;
            }
            return createFromTsType(tstype as Type);
        },
        createNeverType(): FloughType {
            return { nobj:{} };
        },
        createTrueType(): Readonly<FloughType> {
            return { nobj: { boolTrue: true } };
        },
        createFalseType(): Readonly<FloughType> {
            return { nobj: { boolFalse: true } };
        },
        createBooleanType(): Readonly<FloughType> {
            return { nobj: { boolTrue: true, boolFalse: true } };
        },
        createLiteralStringType(s: string): Readonly<FloughType> {
            return { nobj: { string: new Set<LiteralType>([checker.getStringLiteralType(s)]) } } as FloughType;
        },
        getNeverType(){
                return uniqueNeverType;
        },
        cloneRefTypesType(t: Readonly<FloughType>): FloughType {
            castReadonlyFloughTypei(t);
            return cloneType(t);
        },
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: FloughType}): FloughType {
            castReadonlyFloughTypei(target);
            return unionWithTsTypeMutate(source,target);
        },
        mergeToRefTypesType({source:_a,target:_b}: { source: Readonly<FloughType>, target: FloughType}): void {
            Debug.fail("mergeToRefTypesType is deprecated");
        },
        unionOfRefTypesType(types: Readonly<FloughType[]>): FloughType {
            let ft = createNeverType();
            types.forEach((t,_i)=>{
                castReadonlyFloughTypei(t);
                ft = unionWithFloughTypeMutate(t,ft);
            });
            return ft;
        },
        NOTINSERVICE_intersectionOfRefTypesType(..._args: Readonly<FloughType>[]): FloughType {
            Debug.fail("DEADintersectionOfRefTypesTypeDEAD");
            // if (args.length === 0) return createNeverType();
            // castReadonlyFloughTypei(args[0]);
            // let ft = cloneType(args[0]);
            // args.slice(1).forEach((t,_i)=>{
            //     castReadonlyFloughTypei(t);
            //     ft = intersectionWithFloughTypeSpecial(t,ft);
            // });
            // return ft;
        },
        isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
            // The above commented out code should give the same answer but maybe be faster.  But this is more simple. TODO: compare performance.
            castReadonlyFloughTypei(a);
            castReadonlyFloughTypei(b);
            const diff = differenceWithFloughTypeMutate(b,cloneType(a));
            return isNeverType(diff);
        },
        NOTINSERVICE_subtractFromType(subtrahend: Readonly<FloughType>, minuend: Readonly<FloughType>, /* errorOnMissing = false */): FloughType {
            castReadonlyFloughTypei(subtrahend);
            castReadonlyFloughTypei(minuend);
            return differenceWithFloughTypeMutate(subtrahend,cloneType(minuend));
        },
        getTsTypeFromFloughType,
        isNeverType(type: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(type);
            return isNeverType(type);
        },
        isAnyType(type: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(type);
            return isAnyOrUnknownType(type);
        },
        isUnknownType(type: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(type);
            return isAnyOrUnknownType(type);
        },
        isAnyOrUnknownType(type: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(type);
            return isAnyOrUnknownType(type);
        },
        forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<FloughType>, f: F): void {
            castReadonlyFloughTypei(type);
            const tsType = getTsTypeFromFloughType(type);
            checker.forEachType(tsType,(t: Type)=>{
                // Called in brackets to avoid accidentally returning a value from forEachType - which causes checker.forEachType to quit early.
                f(t);
            });
        },
        equalRefTypesTypes(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(a);
            castReadonlyFloughTypei(b);
            if (a === b) return true;
            if (isNeverType(a) && isNeverType(b)) return true;
            if (isAnyOrUnknownType(a)||isAnyOrUnknownType(b)) return false;
            if ((a.logicalObject||b.logicalObject) && a.logicalObject!==b.logicalObject) return false;
            return equalFloughTypesNobj(a.nobj,b.nobj);
        },
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): void {
            castFloughTypei(type);
            const tmp = unionWithTsTypeMutate(tstype,type);
            // unionWithTsTypeMutate possibly returns a new type,
            // whereas the old interface addTsTypeNonUnionToRefTypesTypeMutate strictly mutates the type argument and returns void
            // so we need to copy the properties back to the original type.
            if (!(type.any = tmp.any)) delete type.any;
            if (!(type.unknown = tmp.unknown)) delete type.unknown;
            if (!(type.logicalObject = tmp.logicalObject)) delete type.logicalObject;
            type.nobj = tmp.nobj;
        },
        intersectionsAndDifferencesForEqualityCompare,
        dbgRefTypesTypeToStrings(type: Readonly<FloughType>): string[] {
            castReadonlyFloughTypei(type);
            return dbgFloughTypeToStrings(type);
        },
        getTsTypesFromFloughType,
        intersectionWithFloughTypeSpecial,
        hasLogicalObject,
        getLogicalObject,
        createTypeFromLogicalObject,
        setLogicalObjectMutate,
        widenNobjTypeByEffectiveDeclaredNobjType,
        createFromTsType,
        createFromTsTypes,
        unionWithTsTypeMutate,
        cloneType,
        //differenceWithFloughTypeMutate,
        //intersectionWithFloughTypeSpecialMutate,
        unionWithFloughTypeMutate,
        createNumberType(): FloughType {
            return { nobj: { number: true } };
        },
        createUndefinedType(): FloughType {
            return { nobj: { undefined: true } };
        },
        getLiteralNumberTypes(ft: Readonly<FloughType>): LiteralType[] | undefined{
            castReadonlyFloughTypei(ft);
            if (ft.nobj.number && ft.nobj.number!==true) return setToArray(ft.nobj.number);
            return undefined;
        },
        getLiteralStringTypes(ft: Readonly<FloughType>): LiteralType[] | undefined{
            castReadonlyFloughTypei(ft);
            if (ft.nobj.string && ft.nobj.string!==true) return setToArray(ft.nobj.string);
            return undefined;
        },
        hasNumberType(ft: Readonly<FloughType>, intrinsicNumberTypeOnly?: true): boolean {
            castReadonlyFloughTypei(ft);
            if (!ft.nobj.number) return false;
            if (ft.nobj.number===true) return true;
            if (intrinsicNumberTypeOnly) return false;
            return true; // returning true even though it is not an intrinsic number type, but a set of literal numbers
        },
        hasStringType(ft: Readonly<FloughType>, intrinsicStringTypeOnly?: true): boolean {
            castReadonlyFloughTypei(ft);
            if (!ft.nobj.string) return false;
            if (ft.nobj.string===true) return true;
            if (intrinsicStringTypeOnly) return false;
            return true; // returning true even though it is not an intrinsic number type, but a set of literal numbers
        },
        hasUndefinedType(ft: Readonly<FloughType>): boolean {
            return !!(ft as FloughTypei).nobj.undefined;
        },
        isEqualToUndefinedType(ft: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(ft);
            return this.hasUndefinedType(ft) && !this.hasLogicalObject(ft) && Object.keys(ft.nobj).length===1;
        },
        hasUndefinedOrNullType(ft: Readonly<FloughType>): boolean {
            castFloughTypei(ft);
            return !!(ft.nobj.undefined || ft.nobj.null);
        },
        getObjectUsableAccessKeys,
        splitLogicalObject,
        removeUndefinedNullMutate(ft: FloughType): void {
            castFloughTypei(ft);
            delete ft.nobj.undefined;
            delete ft.nobj.null;
        },
        addUndefinedTypeMutate(ft: FloughType): void {
            castFloughTypei(ft);
            ft.nobj.undefined = true;
        },
        intersectionWithUndefinedNull(ft: Readonly<FloughType>): FloughType | undefined {
            castFloughTypei(ft);
            const rt: FloughTypei = { nobj:{} };
            let zilch = true;
            if (ft.nobj.undefined) {
                rt.nobj.undefined=true;
                zilch = false;
            }
            if (ft.nobj.null) {
                rt.nobj.null=true;
                zilch = false;
            }
            if (zilch) return undefined;
            return rt;
        },
        dbgFloughTypeToStrings,
        dbgFloughTypeToString,
    };

    export const floughTypeModuleForFloughLogicalObject: {
        createFloughTypeFromLogicalObject(logicalObject: FloughLogicalObjectIF): FloughType;
    } = {
        createFloughTypeFromLogicalObject(logicalObject: FloughLogicalObjectIF){
            return { nobj:{}, logicalObject };
        }
    };

    function setToArray<T>(set: Set<T>): T[] {
        const result: T[] = [];
        set.forEach((value: T)=>{
            result.push(value);
        });
        return result;
    }

    function castFloughTypei(_ft: FloughType): asserts _ft is FloughTypei {}
    function castReadonlyFloughTypei(_ft: FloughType): asserts _ft is Readonly<FloughTypei> {}
    const checker = 0 as any as TypeChecker;
    const compilerOptions = 0 as any as CompilerOptions;

    export function initFloughTypeModule(checkerIn: TypeChecker, compilerOptionsIn: CompilerOptions): void {
        (checker as any) = checkerIn;
        (compilerOptions as any) = compilerOptionsIn;
    }

    type FloughTypeNobj= & {
        string?: true | Set<LiteralType>;
        number?: true | Set<LiteralType>;
        bigint?: true | Set<LiteralType>;
        null?: true;
        undefined?: true;
        boolTrue?: true;
        boolFalse?: true;
        symbol?: true;
        uniqueSymbol?: true;
        void?: true;
    };


    type FloughTypei = & {
        any?: true;
        unknown?: true;
        nobj: FloughTypeNobj;
        logicalObject?: FloughLogicalObjectIF;
    };

    function createNeverType(): FloughTypei {
        return { nobj:{} };
    }
    function createAnyType(): FloughTypei {
        return { any: true, nobj:{} };
    }
    function createUnknownType(): FloughTypei {
        return { unknown: true, nobj:{} };
    }

    function cloneTypeNobj(nobj: Readonly<FloughTypeNobj>): FloughTypeNobj {
        const nobj1 = { ...nobj };
        if (nobj1.string && nobj1.string !== true) nobj1.string = new Set(nobj1.string);
        if (nobj1.number && nobj1.number !== true) nobj1.number = new Set(nobj1.number);
        if (nobj1.bigint && nobj1.bigint !== true) nobj1.bigint = new Set(nobj1.bigint);
        return nobj1;
    }
    function cloneType(ft: Readonly<FloughTypei>): FloughTypei {
        const { nobj, ...ftRest } = ft;
        return {
            nobj: cloneTypeNobj(ft.nobj),
            ...ftRest,
        };
    }

    function isNeverTypeNobj(ft: Readonly<FloughTypeNobj>): boolean {
        let empty = true;
        for (const _key in ft) {
            empty = false;
            break;
        }
        return empty;
    }
    // @ ts-expect-error
    function isNeverType(ft: Readonly<FloughTypei>): boolean {
        return ft===uniqueNeverType || !ft.any && !ft.unknown && !ft.logicalObject && isNeverTypeNobj(ft.nobj);
    }
    // @ ts-expect-error
    function isAnyType(ft: Readonly<FloughTypei>): boolean {
        return  !!ft.any;
    }
    // @ ts-expect-error
    function isUnknownType(ft: Readonly<FloughTypei>): boolean {
        return  !!ft.unknown;
    }
    // @ ts-expect-error
    function isAnyOrUnknownType(ft: Readonly<FloughTypei>): boolean {
        return  !!ft.any || !!ft.unknown;
    }

    function getTsTypeFromFloughType(ft: Readonly<FloughTypei>, forNodeToTypeMap?: boolean): Type {
        const at = getTsTypesFromFloughType(ft, forNodeToTypeMap);
        if (at.length === 1) return at[0];
        return checker.getUnionType(at);
    }
    function getTsTypesFromFloughType(ft: Readonly<FloughTypei>, forNodeToTypeMap?: boolean): Type[] {
        if (!ft) Debug.fail("getTsTypeFromFloughType: ft is undefined");
        if (!ft.nobj) Debug.fail("getTsTypeFromFloughType: ft.nobj is undefined");
        if (ft.any) return [checker.getAnyType()];
        if (ft.unknown) return [checker.getUnknownType()];
        const at = getTsTypesFromFloughTypeNobj(ft.nobj);
        // Now for the objects.
        if (ft.logicalObject) {
            // TODO: return the narrowed types.
            at.push(floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(ft.logicalObject, forNodeToTypeMap));
        }
        if (at.length === 0) return [checker.getNeverType()];
        return at;
    }
    // @ ts-expect-error
    // function intersectionWithObjectSimplificationV2(a: Readonly<FloughTypei>,b: Readonly<FloughTypei>): FloughTypei {
    //     const {logicalObject: alogobj, remaining: anobjt} = splitLogicalObject(a);
    //     const {logicalObject: blogobj, remaining: bnobjt} = splitLogicalObject(b);
    //     const nobjt = intersectionWithFloughTypeSpecialMutate(anobjt,bnobjt);
    //     if (!alogobj || !blogobj) return nobjt;
    //     return createTypeFromLogicalObject(blogobj,nobjt);
    // }
    // function intersectionWithFloughTypeSpecial(a: Readonly<FloughTypei>,b: Readonly<FloughTypei>): FloughTypei {
    //     const t = cloneType(b);
    //     return intersectionWithFloughTypeSpecialMutate(a,t);
    //     // if (disableLogicalObjectIntersections) return intersectionWithObjectSimplificationV2(a,b);
    //     // else return intersectionWithObjectSimplificationV1(a,b);
    // }

    // @ ts-expect-error
    // function intersectionWithObjectSimplificationV1(a: Readonly<FloughTypei>,b: Readonly<FloughTypei>): FloughTypei {
    //     const types = [a,b];
    //     Debug.assert(types.length === 2);
    //     castReadonlyFloughTypei(types[0]);
    //     const arrlogobj: FloughLogicalObjectIF[] = [];
    //     let blogobj = false;
    //     let ft = cloneType(types[0]);
    //     if (ft.logicalObject) {
    //         blogobj = true;
    //         arrlogobj.push(ft.logicalObject);
    //         delete ft.logicalObject;
    //     }
    //     {
    //         if (isNeverType(ft) && !blogobj) return ft;
    //         const t = types[1];
    //         castReadonlyFloughTypei(t);
    //         if (t.logicalObject) {
    //             if (blogobj) arrlogobj.push(t.logicalObject);
    //         }
    //         else if (blogobj) blogobj = false;
    //         // t.logicalObject will be elided in intersectionWithFloughTypeMutate because ft has no logical object.
    //         ft = intersectionWithFloughTypeSpecialMutate(t,ft);
    //     };
    //     if (!blogobj) return ft;
    //     const test = true;
    //     if (test){
    //         ft.logicalObject = arrlogobj[1];
    //     }
    //     else ft.logicalObject = floughLogicalObjectModule.intersectionAndSimplifyLogicalObjects(arrlogobj[0],arrlogobj[1]); // note that this may return undefined.
    //     if (!ft.logicalObject) delete ft.logicalObject; // delete the undefined member.
    //     return ft;
    // }

    function getTsTypesFromFloughTypeNobj(ft: Readonly<FloughTypeNobj>): Type[] {
        const at: Type[] = [];
        if (ft.string) {
            if (ft.string === true) {
                at.push(checker.getStringType());
            }
            else {
                ft.string.forEach(l => at.push(l));
            }
        }
        if (ft.number) {
            if (ft.number === true) {
                at.push(checker.getNumberType());
            }
            else {
                ft.number.forEach(l => at.push(l));
            }
        }
        if (ft.bigint) {
            if (ft.bigint === true) {
                at.push(checker.getBigIntType());
            }
            else {
                ft.bigint.forEach(l => at.push(l));
            }
        }
        if (ft.null) {
            at.push(checker.getNullType());
        }
        if (ft.undefined) {
            at.push(checker.getUndefinedType());
        }
        if (ft.void) {
            at.push(checker.getVoidType());
        }
        if (ft.boolTrue) {
            at.push(checker.getTrueType());
        }
        if (ft.boolFalse) {
            at.push(checker.getFalseType());
        }
        if (ft.symbol) {
            at.push(checker.getESSymbolType());
        }
        if (ft.uniqueSymbol) {
            Debug.fail("uniqueSymbol not implemented");
            //at.push(checker.getUniqueSymbolType());
        }
        return at;
    }

    function createFromTsTypes(tstypes: Readonly<Type[]>, logicalObject?: Readonly<FloughLogicalObjectIF> | undefined): FloughTypei {
        return tstypes.reduce((accum,current)=>{
            return unionWithTsTypeMutate(current,accum);
        }, logicalObject ? createTypeFromLogicalObject(logicalObject) : createNeverType());
    }
    function setLogicalObjectMutate(logicalObject: Readonly<FloughLogicalObjectIF>, ft: FloughTypei): void {
        ft.logicalObject = logicalObject;
    }
    function createFromTsType(tstype: Readonly<Type>, logicalObject?: Readonly<FloughLogicalObjectIF> | undefined): FloughTypei {
        return unionWithTsTypeMutate(tstype, logicalObject ? createTypeFromLogicalObject(logicalObject) : createNeverType());
    }
    function unionWithTsTypeMutate(tstype: Readonly<Type>, ftin: FloughTypei): FloughTypei {

        if (ftin.any) return ftin;
        if (tstype.flags & TypeFlags.Any) {
            return createAnyType();
        }
        if (ftin.unknown) return ftin;
        if (tstype.flags & TypeFlags.Unknown) {
            ftin.unknown = true;
            return createUnknownType();
        }
        let nobj = ftin.nobj;
        let logicalObject = ftin.logicalObject;
        function doUnionOne(t: Type, expectOnlyPrimitive?: true): void {
            //if (t.flags & TypeFlags.Union) Debug.fail("unexpected: union in doUnionOne");
            if (t.flags & TypeFlags.Never) return;
            if (t.flags & TypeFlags.StringLike) {
                if (t.flags & TypeFlags.String){
                    nobj.string = true;
                    return;
                }
                if (t.flags & TypeFlags.StringLiteral){
                    if (!nobj.string || nobj.string===true) {
                        nobj.string = new Set<LiteralType>();
                    }
                    nobj.string.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.NumberLike) {
                if (t.flags & TypeFlags.Number){
                    nobj.number = true;
                    return;
                }
                if (t.flags & TypeFlags.NumberLiteral){
                    if (!nobj.number || nobj.number===true) {
                        nobj.number = new Set<LiteralType>();
                    }
                    nobj.number.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.BigIntLike) {
                if (t.flags & TypeFlags.BigInt){
                    nobj.bigint = true;
                    return;
                }
                if (t.flags & TypeFlags.BigIntLiteral){
                    if (!nobj.bigint || nobj.bigint===true) {
                        nobj.bigint = new Set<LiteralType>();
                    }
                    nobj.bigint.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.BooleanLike) {
                if (t.flags & TypeFlags.BooleanLiteral){
                    if (t===checker.getTrueType()){
                        nobj.boolTrue = true;
                    }
                    else {
                        nobj.boolFalse = true;
                    }
                    return;
                }
                else if (t.flags & TypeFlags.Boolean){
                    nobj.boolTrue = true;
                    nobj.boolFalse = true;
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.ESSymbol) {
                nobj.symbol = true;
                return;
            }
            if (t.flags & TypeFlags.UniqueESSymbol) {
                // Is this really implemented in TS? Cannot see how to get a/the type of this from checker.
                nobj.uniqueSymbol = true;
                return;
            }
            if (t.flags & TypeFlags.Void) {
                //nobj.void = true;
                nobj.undefined = true; // void is undefined
                return;
            }
            if (t.flags & TypeFlags.Undefined) {
                nobj.undefined = true;
                return;
            }
            if (t.flags & TypeFlags.Null) {
                nobj.null = true;
                return;
            }
            if (expectOnlyPrimitive){
                Debug.fail("unexpected: expectOnlyPrimitive but has ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.Object) {
                if (t.flags & TypeFlags.EnumLiteral || t.flags & TypeFlags.Enum) Debug.fail("unexpected: enum in Object in doUnionOne");
                if (!logicalObject) {
                    logicalObject = floughLogicalObjectModule.createFloughLogicalObjectPlain(t as ObjectType);
                }
                else{
                    logicalObject = floughLogicalObjectModule.unionOfFloughLogicalObject(logicalObject, floughLogicalObjectModule.createFloughLogicalObjectPlain(t as ObjectType));
                }
                return;
            }
            if (t.flags & TypeFlags.Union) {
                if (t.flags & TypeFlags.EnumLiteral) {
                    checker.forEachType(t, (tsub: Type) => {
                        doUnionOne(tsub);
                    });
                    return;
                }

                /**
                 * Instead of recursing into the union, we just add each primitive type in the union to the current type,
                 * and put the non-primitive types into an array so that typescript-type maintains the union structure -
                 * this is beneficial when returning the type to typescript, because typescript can then use the union.
                 * But - since have removed the pritimive types, it's not exactly the same - we have to be careful.
                 */
                // TODO: might want to consider using t.origin if it exists, because it is possibly a more time & space efficient representation
                assertCastType<UnionType>(t);
                const arrlogobj: FloughLogicalObjectIF[] = [];
                let hasAny=false;
                let hasUnknown=false;
                t.types.forEach(tsub => {
                    if (tsub.flags & TypeFlags.Any) hasAny=true;
                    else if (tsub.flags & TypeFlags.Unknown) hasUnknown=true;
                });
                if (hasAny||hasUnknown) {
                    if (hasAny) ftin = createAnyType();
                    if (hasUnknown) ftin = createUnknownType();
                    return;
                }
                checker.forEachType(t,tsub=> {
                //t.types.forEach(tsub => {
                    if (hasAny || hasUnknown) return;
                    if (t.flags & TypeFlags.EnumLiteral || t.flags & TypeFlags.Enum) Debug.fail("unexpected: [2] enum in Object in doUnionOne");
                    if ((tsub.flags & TypeFlags.Object)) {
                        arrlogobj.push(floughLogicalObjectModule.createFloughLogicalObjectPlain(tsub as ObjectType));
                        return;
                    }
                    if ((tsub.flags & TypeFlags.Intersection)) {
                        const isectarrlogobj: FloughLogicalObjectIF[] = [];
                        (tsub as IntersectionType).types.forEach(itsub=>{
                            if (!(itsub.flags & TypeFlags.Object) || (t.flags & TypeFlags.EnumLiteral || t.flags & TypeFlags.Enum)){
                                Debug.fail("unexpected insterscetion member");
                            }
                            isectarrlogobj.push(floughLogicalObjectModule.createFloughLogicalObjectPlain(itsub as ObjectType));
                        });
                        arrlogobj.push(floughLogicalObjectModule.createFloughLogicalObjectTsintersection(
                            tsub as IntersectionType, isectarrlogobj));
                        return;
                    }
                    if ((tsub.flags & TypeFlags.Union)) Debug.fail("unexpected: union in union");
                    // if (!(tsub.flags & TypeFlags.Object)){
                    //     doUnionOne(tsub);
                    //     return;
                    // }
                    // else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                    //     const ftsub  = createFromTsType(tsub);
                    //     if (ftsub.any || ftsub.unknown) {
                    //         if (ftsub.any) hasAny=true;
                    //         if (ftsub.unknown) hasUnknown=true;
                    //         return;
                    //     }
                    //     const {logicalObject:logicalObjectSub, nobj: nobjSub} = ftsub;
                    //     nobj = unionWithFloughTypeNobjMutate(nobjSub, nobj);
                    //     if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    // }
                    doUnionOne(tsub, /* expectOnlyPrimitive */ true);
                });
                if (hasAny||hasUnknown) {
                    if (hasAny) ftin = createAnyType();
                    if (hasUnknown) ftin = createUnknownType();
                    return;
                }
                if (arrlogobj.length!==0) {
                    let logobj;
                    if (arrlogobj.length===t.types.length){
                        logobj = floughLogicalObjectModule.createFloughLogicalObjectTsunion(t,arrlogobj);
                    }
                    else {
                        logobj = floughLogicalObjectModule.unionOfFloughLogicalObjects(arrlogobj)!;
                    }
                    if (!logicalObject) {
                        logicalObject = logobj;
                    }
                    else {
                        logicalObject = floughLogicalObjectModule.unionOfFloughLogicalObject(logicalObject, logobj);
                    }
                }
                return;
            }
            if (t.flags & TypeFlags.Intersection) {
                assertCastType<IntersectionType>(t);
                /**
                 * Similarly to Union, we are trying to preserve the intersection structure, but we have to be careful.
                 */
                // TODO: might want to consider using t.origin if it exists, because it is possibly a more time & space efficient representation
                /**
                 * first calulcate the typescript-intersection type, then union that result with the current flough-type
                 */
                const arrlogobj: FloughLogicalObjectIF[] = [];
                Debug.assert(t.types.length!==0);
                let hasAny=false;
                let hasUnknown=false;
                t.types.forEach(tsub => {
                    if (tsub.flags & TypeFlags.Any) hasAny=true;
                    else if (tsub.flags & TypeFlags.Unknown) hasUnknown=true;
                });
                if (hasAny) {
                    if (hasAny) ftin = createAnyType();
                    //if (hasUnknown) ftin = createUnknownType();
                    return;
                }
                let nobjSubjIsect: FloughTypeNobj | undefined;
                t.types.forEach(tsub => {
                    if (tsub.flags & (TypeFlags.Any|TypeFlags.Unknown)) return;
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(floughLogicalObjectModule.createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const {logicalObject:logicalObjectSub, nobj:nobjSub}  = createFromTsType(tsub);
                        if (!nobjSubjIsect) nobjSubjIsect = nobjSub;
                        else nobjSubjIsect = intersectionWithFloughTypeNobjMutate(nobjSub, nobjSubjIsect);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                    else {
                        const {logicalObject:logicalObjectSub, nobj:nobjSub}  = createFromTsType(tsub);
                        if (!nobjSubjIsect) nobjSubjIsect = nobjSub;
                        else nobjSubjIsect = intersectionWithFloughTypeNobjMutate(nobjSub, nobjSubjIsect);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                });
                if (hasUnknown && !nobjSubjIsect) {
                    Debug.assert(arrlogobj.length===0);
                    ftin = createUnknownType();
                    //if (hasUnknown) ftin = createUnknownType();
                    return;
                }
                if (nobjSubjIsect){
                    nobj = unionWithFloughTypeNobjMutate(nobjSubjIsect, nobj);
                }
                if (arrlogobj.length!==0) {
                    const logobj = floughLogicalObjectModule.createFloughLogicalObjectTsintersection(t,arrlogobj);
                    if (!logicalObject) {
                        logicalObject = logobj;
                    }
                    else {
                        logicalObject = floughLogicalObjectModule.unionOfFloughLogicalObject(logicalObject, logobj);
                    }
                }
                return;
            }
            Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(tstype.flags));
        }
        doUnionOne(tstype);
        if (ftin.any||ftin.unknown) {
            Debug.assert(!logicalObject && isNeverTypeNobj(nobj) && !(ftin.any&&ftin.unknown));
            return ftin;
        }
        return { nobj, logicalObject };
    }
    /**
     * create the union of two flough-types, where neither has an object type
     * @param ft0
     * @param ft1
     * @returns
     */
    function unionWithFloughTypeMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei): FloughTypei {
        if (ft0.any||ft1.any) return createAnyType();
        if (ft0.unknown||ft1.unknown) {
            if (ft0.unknown && ft1.unknown) {
                return createUnknownType(); // for debug
            }
            return createUnknownType();
        }
        ft1.nobj = unionWithFloughTypeNobjMutate(ft0.nobj, ft1.nobj);
        if (ft0.logicalObject){
            if (ft1.logicalObject) {
                ft1.logicalObject = floughLogicalObjectModule.unionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
            }
            else {
                ft1.logicalObject = ft0.logicalObject;
            }
        }
        return ft1;
    }
    function unionWithFloughTypeNobjMutate(ft0: Readonly<FloughTypeNobj>, ft1: FloughTypeNobj): FloughTypeNobj {
        if (isNeverTypeNobj(ft0) && isNeverTypeNobj(ft1)) return {};
        if (ft0.string){
            if (ft1.string===undefined) {
                if (ft0.string===true) ft1.string = true;
                else ft1.string = new Set<LiteralType>(ft0.string);
            }
            else if (ft1.string!==true) {
                if (ft0.string===true) ft1.string = true;
                else {
                    ft0.string.forEach(lit => (ft1.string as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.number){
            if (ft1.number===undefined) {
                if (ft0.number===true) ft1.number = true;
                else ft1.number = new Set<LiteralType>(ft0.number);
            }
            else if (ft1.number!==true) {
                if (ft0.number===true) ft1.number = true;
                else {
                    ft0.number.forEach(lit => (ft1.number as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.bigint){
            if (ft1.bigint===undefined) {
                if (ft0.bigint===true) ft1.bigint = true;
                else ft1.bigint = new Set<LiteralType>(ft0.bigint);
            }
            else if (ft1.bigint!==true) {
                if (ft0.bigint===true) ft1.bigint = true;
                else {
                    ft0.bigint.forEach(lit => (ft1.bigint as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.boolTrue) ft1.boolTrue = true;
        if (ft0.boolFalse) ft1.boolFalse = true;
        if (ft0.null) ft1.null = true;
        if (ft0.void) ft1.void = true;
        if (ft0.undefined) ft1.undefined = true;
        if (ft0.symbol) ft1.symbol = true;
        if (ft0.uniqueSymbol) ft1.uniqueSymbol = true;
        return ft1;
    }

    function intersectionWithFloughTypeSpecial(ft0: Readonly<FloughTypei>, ft1: Readonly<FloughTypei>): FloughTypei {
        if (ft0.any && ft1.any) return ft0;
        if (ft0.unknown && ft1.unknown) return ft0;
        if (ft0.any) return ft1;
        if (ft1.any) return ft0;
        if (ft0.unknown) return ft1;
        if (ft1.unknown) return ft0;
        const nobj = intersectionWithFloughTypeNobjMutate(ft0.nobj, { ...ft1.nobj });
        if (!ft0.logicalObject){
            return { nobj };
            //delete ft1.logicalObject; // no error if not present
        }
        // else if (ft1.logicalObject) {

        //     // Doing nothing because intersection of logical objects is hard to compute.
        //     // ft1.logicalObject = floughLogicalObjectModule.intersectionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
        // }
        return { nobj, logicalObject: ft1.logicalObject };
    }
    function intersectionWithFloughTypeNobjMutate(ft0: Readonly<FloughTypeNobj>, ft1: FloughTypeNobj): FloughTypeNobj {
        if (isNeverTypeNobj(ft0) || isNeverTypeNobj(ft1)) return {};
        if (ft1.string) {
            if (ft0.string===undefined) delete ft1.string;
            else if (ft0.string!==true) {
                if (ft1.string===true) ft1.string = new Set<LiteralType>(ft0.string);
                else {
                    ft1.string.forEach((v)=>{
                        if (!(ft0.string as Set<LiteralType>).has(v)) (ft1.string as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.number) {
            if (ft0.number===undefined) delete ft1.number;
            else if (ft0.number!==true) {
                if (ft1.number===true) ft1.number = new Set<LiteralType>(ft0.number);
                else {
                    ft1.number.forEach((v)=>{
                        if (!(ft0.number as Set<LiteralType>).has(v)) (ft1.number as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.bigint) {
            if (ft0.bigint===undefined) delete ft1.bigint;
            else if (ft0.bigint!==true) {
                if (ft1.bigint===true) ft1.bigint = new Set<LiteralType>(ft0.bigint);
                else {
                    ft1.bigint.forEach((v)=>{
                        if (!(ft0.bigint as Set<LiteralType>).has(v)) (ft1.bigint as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.boolTrue) {
            if (ft0.boolTrue===undefined) delete ft1.boolTrue;
        }
        if (ft1.boolFalse) {
            if (ft0.boolFalse===undefined) delete ft1.boolFalse;
        }
        if (ft1.symbol) {
            if (ft0.symbol===undefined) delete ft1.symbol;
        }
        if (ft1.uniqueSymbol) {
            if (ft0.uniqueSymbol===undefined) delete ft1.uniqueSymbol;
        }
        if (ft1.null) {
            if (ft0.null===undefined) delete ft1.null;
        }
        if (ft1.void) {
            if (ft0.null===undefined) delete ft1.void;
        }
        if (ft1.undefined) {
            if (ft0.undefined===undefined) delete ft1.undefined;
        }
        return ft1;
    }

    /**
     * `subtrahend` is subtracted from `minuend`, possibly mutating input minuend.  The resulting minuend is returned, which may be different from the input minuend.
     * The input minuend should not be used after this function is called.
     * The input subtrahend and output minuend are mutually exclusive, with exceptions as follows
     * - string/number/bigint literals cannot be subtracted from string/number/bigint, because there is no represention for the not-literal case.
     *
     *
     * @param subtrahend
     * @param minuend
     * @returns
     */
    // @ ts-expect-error
    function differenceWithFloughTypeMutate(subtrahend: Readonly<FloughTypei>, minuend: FloughTypei): FloughTypei {
        if (minuend.any) return minuend; // no way to represent not-subtrahend
        if (subtrahend.any) return createNeverType();
        if (subtrahend.unknown) return createNeverType();
        if (minuend.unknown) return minuend; // no way to represent not-subtrahend
        minuend.nobj = differenceWithFloughTypeNobjMutate(subtrahend.nobj, minuend.nobj);
        if (subtrahend.logicalObject && minuend.logicalObject) {
            Debug.fail("differenceWithFloughTypeMutate: not yet implemented");
            // Do nothing
            //minuend.logicalObject = floughLogicalObjectModule.differenceOfFloughLogicalObject(subtrahend.logicalObject, minuend.logicalObject);
        }
        return minuend;
    }
    function differenceWithFloughTypeNobjMutate(subtrahend: Readonly<FloughTypeNobj>, minuend: FloughTypeNobj): FloughTypeNobj {
        if (isNeverTypeNobj(subtrahend)) return minuend;
        if (isNeverTypeNobj(minuend)) return {};

        function fndiff(k: "number" | "string" | "bigint"): void {
            const sk = subtrahend[k];
            const mk = minuend[k];
            if (sk && mk) {
                if (sk===true) delete minuend[k];
                else if (mk!==true){
                    sk.forEach((v)=>{
                        mk.delete(v);
                    });
                    if (mk.size===0) delete minuend[k];
                }
            }
        }
        fndiff("string");
        fndiff("number");
        fndiff("bigint");

        if (subtrahend.boolFalse && minuend.boolFalse) {
            delete minuend.boolFalse;
        }
        if (subtrahend.boolTrue && minuend.boolTrue) {
            delete minuend.boolTrue;
        }
        if (subtrahend.symbol && minuend.symbol) {
            delete minuend.symbol;
        }
        if (subtrahend.uniqueSymbol && minuend.uniqueSymbol) {
            delete minuend.uniqueSymbol;
        }
        if (subtrahend.null && minuend.null) {
            delete minuend.null;
        }
        if (subtrahend.undefined && minuend.undefined) {
            delete minuend.undefined;
        }
        if (subtrahend.void && minuend.void) {
            delete minuend.void;
        }
        return minuend;
    }

    // @ ts-expect-error
    // function isSubsetOfFloughTypeNobj(subset: Readonly<FloughTypeNobj>, superset: Readonly<FloughTypeNobj>): boolean {
    //     if (subset.boolFalse && !superset.boolFalse) return false;
    //     if (subset.boolTrue && !superset.boolTrue) return false;
    //     if (subset.symbol && !superset.symbol) return false;
    //     if (subset.uniqueSymbol && !superset.uniqueSymbol) return false;
    //     if (subset.null && !superset.null) return false;
    //     if (subset.undefined && !superset.undefined) return false;
    //     if (subset.void && !superset.void) return false;
    //     if (subset.string) {
    //         if (!superset.string) return false;
    //         if (subset.string===true){
    //             if (superset.string!==true) return false;
    //         }
    //         else if (superset.string!==true){
    //             for (let iter = subset.string.values(), it=iter.next(); !it.done; it=iter.next()){
    //                 if (!superset.string.has(it.value)) return false;
    //             }
    //         }
    //     }
    //     if (subset.number) {
    //         if (!superset.number) return false;
    //         if (subset.number===true){
    //             if (superset.number!==true) return false;
    //         }
    //         else if (superset.number!==true){
    //             for (let iter = subset.number.values(), it=iter.next(); !it.done; it=iter.next()){
    //                 if (!superset.number.has(it.value)) return false;
    //             }
    //         }
    //     }
    //     if (subset.bigint) {
    //         if (!superset.bigint) return false;
    //         if (subset.bigint===true){
    //             if (superset.bigint!==true) return false;
    //         }
    //         else if (superset.bigint!==true){
    //             for (let iter = subset.bigint.values(), it=iter.next(); !it.done; it=iter.next()){
    //                 if (!superset.bigint.has(it.value)) return false;
    //             }
    //         }
    //     }
    //     return true;
    // }

    function equalFloughTypesNobj(a: Readonly<FloughTypeNobj>, b: Readonly<FloughTypeNobj>): boolean {
        if (a.boolFalse!==b.boolFalse) return false;
        if (a.boolTrue!==b.boolTrue) return false;
        if (a.symbol!==b.symbol) return false;
        if (a.uniqueSymbol!==b.uniqueSymbol) return false;
        if (a.null!==b.null) return false;
        if (a.undefined!==b.undefined) return false;
        if (a.void!==b.void) return false;
        function feq1(k: "string" | "number" | "bigint"): boolean {
            const ak = a[k];
            const bk = b[k];
            if (!ak!==!bk) return false;
            if (ak) {
                Debug.assert(bk);
                if (ak===true){
                    if (bk!==true) return false;
                }
                else {
                    if (bk===true) return false;
                    if (ak.size!==bk.size) return false;
                    for (let iter = ak.values(), it=iter.next(); !it.done; it=iter.next()){
                        if (!bk.has(it.value)) return false;
                    }
                    for (let iter = bk.values(), it=iter.next(); !it.done; it=iter.next()){
                        if (!ak.has(it.value)) return false;
                    }
                }
            }
            return true;
        }
        if (!feq1("string")) return false;
        if (!feq1("number")) return false;
        if (!feq1("bigint")) return false;
        return true;
    }

    function itemCountFloughTypeNobj(a: Readonly<FloughTypeNobj>): number {
        let count = 0;
        if (a.boolFalse) count++;
        if (a.boolTrue) count++;
        if (a.symbol) count++;
        if (a.uniqueSymbol) count++;
        if (a.null) count++;
        if (a.undefined) count++;
        if (a.void) count++;
        if (a.string) {
            if (a.string===true) count++;
            else count += a.string.size;
        }
        if (a.number) {
            if (a.number===true) count++;
            else count += a.number.size;
        }
        if (a.bigint) {
            if (a.bigint===true) count++;
            else count += a.bigint.size;
        }
        return count;
    }

    // export type IntersectionsAndDifferencesNobjReturnType = & {
    //     bothUnique?: FloughType,
    //     bothNotUnique?: FloughType,
    //     aonly?: FloughType,
    //     bonly?: FloughType
    // };
    // function intersectionsAndDifferencesNobj(a: Readonly<FloughTypei>, b: Readonly<FloughTypei>):
    // IntersectionsAndDifferencesNobjReturnType {
    //     Debug.assert(!hasLogicalObject(a));
    //     Debug.assert(!hasLogicalObject(b));
    //     if (isAnyOrUnknownType(a)) a = b;
    //     if (isAnyOrUnknownType(b)) {
    //         if (a===b) return { bothNotUnique: a };
    //         b = a;
    //     }
    //     const r = intersectionsAndDifferencesNobjInternal(a.nobj, b.nobj);
    //     const ret: IntersectionsAndDifferencesNobjReturnType = {};
    //     if (r.bothUnique) ret.bothUnique = composeFromLogicalObjectAndNobj(/*logicalObject*/ undefined, r.bothUnique);
    //     if (r.bothNotUnique) ret.bothNotUnique = composeFromLogicalObjectAndNobj(/*logicalObject*/ undefined, r.bothNotUnique);
    //     if (r.aonly) ret.aonly = composeFromLogicalObjectAndNobj(/*logicalObject*/ undefined, r.aonly);
    //     if (r.bonly) ret.bonly = composeFromLogicalObjectAndNobj(/*logicalObject*/ undefined, r.bonly);
    //     return ret;
    // }

    export type IntersectionsAndDifferencesNobjInteralReturnType = & {
        bothUnique?: FloughTypeNobj,
        bothNotUnique?: FloughTypeNobj,
        aonly?: FloughTypeNobj,
        bonly?: FloughTypeNobj
    };
    function intersectionsAndDifferencesNobjInternal(a: Readonly<FloughTypeNobj>, b: Readonly<FloughTypeNobj>):
    IntersectionsAndDifferencesNobjInteralReturnType {
        if (getMyDebug()){
            consoleGroup("intersectionsAndDifferencesNobjInternal[in]");
            consoleLog(`intersectionsAndDifferencesNobjInternal[in] a:${dbgFloughTypeNobjToStrings(a)}`);
            consoleLog(`intersectionsAndDifferencesNobjInternal[in] b:${dbgFloughTypeNobjToStrings(b)}`);
        }
        let bothUnique: FloughTypeNobj | undefined;
        let bypassBothUnique = false;
        const bothNotUnique: FloughTypeNobj = {};
        const bothNotUniqueSpec: FloughTypeNobj = {};
        const aonly: FloughTypeNobj = {};
        const bonly: FloughTypeNobj = {};

        function sendBothUniqueToBothNotUnique(x: Readonly<FloughTypeNobj>){
            if (extraAsserts) {
                Debug.assert(itemCountFloughTypeNobj(x)===1);
            }
            const k = Object.keys(x)[0] as keyof FloughTypeNobj;
            if (extraAsserts) Debug.assert(k);
            switch (k) {
                case "boolFalse":
                case "boolTrue":
                case "null":
                case "undefined":{
                    bothNotUnique[k] = true;
                    break;
                }
                case "string":
                case "number":
                case "bigint":{
                    if (extraAsserts){
                        Debug.assert(x[k]!==true && (x[k] as Set<LiteralType>).size===1);
                        Debug.assert(!bothNotUnique[k]);
                    }
                    bothNotUnique[k] = x[k];
                    break;
                }
                default: Debug.fail("unexpected");
            }
            bothUnique = undefined;
            //Debug.fail("TODO: not yet implemented");
        }

        function f1Unique(k: keyof FloughTypeNobj){
            assertCastType<Record<string,boolean>>(a);
            assertCastType<Record<string,boolean>>(b);
            if (a[k]) {
                if (b[k]) {
                    if (bypassBothUnique) bothNotUnique[k] = true;
                    else if (!bothUnique) {
                        bothUnique = {};
                        bothUnique[k] = true;
                        bothNotUniqueSpec[k] = true;
                    }
                    else {
                        bypassBothUnique = true;
                        sendBothUniqueToBothNotUnique(bothUnique);
                        bothNotUnique[k] = true;
                    }
                }
                else {
                    aonly[k] = true;
                }
            }
            else if (b[k]) {
                bonly[k] = true;
            }
        }
        f1Unique("boolFalse");
        f1Unique("boolTrue");
        f1Unique("null");
        f1Unique("undefined");


        function f1(k: keyof FloughTypeNobj){
            assertCastType<Record<string,boolean>>(a);
            assertCastType<Record<string,boolean>>(b);
            if (a[k]) {
                if (b[k]) {
                    bothNotUnique[k] = true;
                    bothNotUniqueSpec[k] = true;

                }
                else {
                    aonly[k] = true;
                }
            }
            else if (b[k]) {
                bonly[k] = true;
            }
        }
        f1("symbol");
        f1("uniqueSymbol");

        function f2(k: "string" | "number" | "bigint"){
            const ak = a[k];
            const bk = b[k];
            if (ak) {
                if (ak===true) {
                    if (bk) {
                        if (bk===true){
                            bothNotUnique[k] = true;
                        }
                        else {
                            /**
                             * The literals of b[k] go to both; a[k] goes to aonly.
                             * Could be unique!
                             */
                            if (!bypassBothUnique && bk.size===1) {
                                if (!bothUnique){
                                    bothUnique = {};
                                    bothUnique[k] = new Set<LiteralType>(bk);
                                }
                                else {
                                    bypassBothUnique = true;
                                    sendBothUniqueToBothNotUnique(bothUnique);
                                    bothNotUnique[k] = new Set<LiteralType>(bk);
                                }
                            }
                            else {
                                bothNotUnique[k] = new Set<LiteralType>(bk);
                            }
                            aonly[k] = true;
                        }
                    }
                    else {
                        aonly[k] = true;
                    }
                }
                else {
                    if (bk) {
                        if (bk===true){
                            /**
                             * The literal of a[k] go to both; b[k] goes to bonly.
                             * Could be unique!
                             */
                            if (!bypassBothUnique && ak.size===1) {
                                if (!bothUnique){
                                    bothUnique = {};
                                    bothUnique[k] = new Set<LiteralType>(ak);
                                }
                                else {
                                    bypassBothUnique = true;
                                    sendBothUniqueToBothNotUnique(bothUnique);
                                    bothNotUnique[k] = new Set<LiteralType>(ak);
                                }
                            }
                            else {
                                bothNotUnique[k] = new Set<LiteralType>(ak);
                            }
                            bonly[k] = true;
                        }
                        else {
                            /** both ak and bk are sets of literals */
                            const sboth = new Set<LiteralType>();
                            const saonly = new Set<LiteralType>();
                            const sbonly = new Set<LiteralType>();
                            ak.forEach((v)=>{
                                if (bk.has(v)) sboth.add(v);
                                else saonly.add(v);
                            });
                            bk.forEach((v)=>{
                                if (!ak.has(v)) sbonly.add(v);
                            });
                            if (sboth.size!==0) {
                                /**
                                 * Could be unique!
                                 */
                                if (!bypassBothUnique && sboth.size===1) {
                                    if (!bothUnique){
                                        bothUnique = {};
                                        bothUnique[k] = sboth;
                                    }
                                    else {
                                        bypassBothUnique = true;
                                        sendBothUniqueToBothNotUnique(bothUnique);
                                        bothNotUnique[k] = sboth;
                                    }
                                }
                                else {
                                    bothNotUnique[k] = sboth;
                                }
                            }
                            if (saonly.size!==0) aonly[k] = saonly;
                            if (sbonly.size!==0) bonly[k] = sbonly;
                        }
                    }
                    else {
                        aonly[k] = new Set(ak);
                    }
                }
            }
            else {
                if (bk) {
                    if (bk===true){
                        bonly[k] = true;
                    }
                    else {
                        bonly[k] = new Set(bk);
                    }
                }
            }
        } // end of f2
        f2("string");
        f2("number");
        f2("bigint");

        const ret: IntersectionsAndDifferencesNobjInteralReturnType = {};
        if (bothUnique) ret.bothUnique = bothUnique;
        if (Object.keys(bothNotUnique).length!==0) ret.bothNotUnique = bothNotUnique;
        if (Object.keys(aonly).length!==0) ret.aonly = aonly;
        if (Object.keys(bonly).length!==0) ret.bonly = bonly;

        if (getMyDebug()){
            const f = (k: keyof typeof ret)=>{
                if (ret[k]) {
                    dbgFloughTypeNobjToStrings(ret[k] as FloughTypeNobj).forEach(s=>consoleLog(`intersectionsAndDifferences[out] ${k}:${s}`));
                }
            };
            f("bothUnique");
            f("bothNotUnique");
            f("aonly");
            f("bonly");
            consoleGroupEnd();
        }
        return ret;
    }


    export type IntersectionsAndDifferencesForEqualityCompareReturnType = & {
        bothUnique?: FloughType,
        bothNotUniqueA?: FloughType,
        bothNotUniqueB?: FloughType,
        aonly?: FloughType,
        bonly?: FloughType
    };
    function intersectionsAndDifferencesForEqualityCompare(aIn: Readonly<FloughTypei>, bIn: Readonly<FloughTypei>):
    IntersectionsAndDifferencesForEqualityCompareReturnType {
        if (aIn.any || aIn.unknown) {
            if (bIn.any || bIn.unknown) {
                if (aIn.any && bIn.any) return { bothNotUniqueA: aIn, bothNotUniqueB: bIn };
                else return { bothNotUniqueA: createUnknownType(), bothNotUniqueB: createUnknownType() };
            }
            aIn = bIn;
        }
        if (bIn.any || bIn.unknown) {
            bIn = aIn;
        }
        const a = aIn.nobj;
        const b = bIn.nobj;
        const aobj = aIn.logicalObject;
        const bobj = bIn.logicalObject;
        if (getMyDebug()){
            consoleGroup("intersectionsAndDifferences[in]");
            consoleLog(`intersectionsAndDifferences[in] a.nobj:${dbgFloughTypeNobjToStrings(a)}`);
            consoleLog(`intersectionsAndDifferences[in] a.obj:${aobj?"<...>":"<undef>"}`);
            consoleLog(`intersectionsAndDifferences[in] b.nobj:${dbgFloughTypeNobjToStrings(b)}`);
            consoleLog(`intersectionsAndDifferences[in] b.obj:${bobj?"<...>":"<undef>"}`);
        }
        const {bothUnique,bothNotUnique,aonly,bonly} = intersectionsAndDifferencesNobjInternal(a, b);
        const ret: IntersectionsAndDifferencesForEqualityCompareReturnType = {};
        if (bothUnique) ret.bothUnique = { nobj: bothUnique };
        if (bothNotUnique && Object.keys(bothNotUnique).length!==0 || (aobj && bobj)) {
            ret.bothNotUniqueA = { nobj: cloneTypeNobj(bothNotUnique!), logicalObject: aobj };
            ret.bothNotUniqueB = { nobj: cloneTypeNobj(bothNotUnique!), logicalObject: bobj };
        }
        if (aonly && Object.keys(aonly).length!==0 || (aobj && !bobj)) {
            ret.aonly = { nobj: { ...aonly }, logicalObject: aobj };
        }
        if (bonly && Object.keys(bonly).length!==0 || (!aobj && bobj)) {
            ret.bonly = { nobj: { ...bonly }, logicalObject: bobj };
        }
        if (getMyDebug()){
            const f = (k: keyof typeof ret)=>{
                if (ret[k]) {
                    dbgFloughTypeNobjToStrings((ret[k] as FloughTypei).nobj).forEach(s=>consoleLog(`intersectionsAndDifferences[out] ${k}.nobj:${s}`));
                    consoleLog(`intersectionsAndDifferences[in] ${k}.obj:${aobj?"<...>":"<undef>"}`);
                }
            };
            f("bothUnique");
            f("bothNotUniqueA");
            f("bothNotUniqueB");
            f("aonly");
            f("bonly");
            consoleGroupEnd();
        }
        return ret;
    }

    function hasLogicalObject(ft: Readonly<FloughType>): boolean {
        castReadonlyFloughTypei(ft);
        return ft.logicalObject!==undefined;
    }
    function getLogicalObject(ft: Readonly<FloughType>): FloughLogicalObjectIF | undefined {
        castReadonlyFloughTypei(ft);
        return ft.logicalObject;
    }
    function composeFromLogicalObjectAndNobj(logicalObject: Readonly<FloughLogicalObjectIF> | undefined, nobj?: Readonly<FloughTypeNobj>): FloughTypei {
        const ret: FloughTypei = { nobj: { ...nobj } };
        if (logicalObject) ret.logicalObject = logicalObject;
        return ret;
    }
    function createTypeFromLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF> | undefined, nonObj?: Readonly<FloughTypei> | undefined): FloughTypei {
        if (nonObj?.any || nonObj?.unknown) return nonObj;
        const nobj = nonObj ? cloneTypeNobj(nonObj.nobj) : undefined;
        return composeFromLogicalObjectAndNobj(logicalObject, nobj);
    }

    function widenNobjTypeByEffectiveDeclaredNobjType(ftin: Readonly<FloughTypei>, effectiveDeclaredType: Readonly<FloughTypei>): FloughTypei {
        let ftout: FloughTypei | undefined;
        const getFtOut = () => ftout ?? (ftout=cloneType(ftin));
        if (effectiveDeclaredType.any || effectiveDeclaredType.unknown || effectiveDeclaredType.nobj.number===true){
            if (ftin.nobj.number && ftin.nobj.number!==true) getFtOut().nobj.number = true;
        }
        if (effectiveDeclaredType.any || effectiveDeclaredType.unknown || effectiveDeclaredType.nobj.string===true){
            if (ftin.nobj.string && ftin.nobj.string!==true) getFtOut().nobj.string = true;
        }
        if (effectiveDeclaredType.any || effectiveDeclaredType.unknown || effectiveDeclaredType.nobj.bigint===true){
            if (ftin.nobj.bigint && ftin.nobj.bigint!==true) getFtOut().nobj.bigint = true;
        }
        return ftout ?? ftin;
    }

    // TODO: ESSymbols
    export type ObjectUsableAccessKeys = & {
        genericNumber: boolean;
        genericString: boolean;
        stringSet: Set<string>; // includes numbers
        numberSubset?: Set<string>; // only numbers, subset of stringSet
    };
    function getObjectUsableAccessKeys(type: Readonly<FloughTypei>): ObjectUsableAccessKeys {
        const genericNumber = type.nobj.number===true;
        const genericString = type.nobj.string===true;
        const stringSet = new Set<string>();
        const numberSubset = new Set<string>(); // only numbers, subset of stringSet
        if (type.nobj.number && type.nobj.number!==true) {
            type.nobj.number.forEach(k=>{
                stringSet.add(k.value.toString());
            });
        }
        if (type.nobj.string && type.nobj.string!==true) {
            type.nobj.string.forEach(k=>{
                stringSet.add(k.value as string);
                if (Number.isSafeInteger(Number(k.value))) numberSubset.add(k.value as string);
            });
        }
        return { genericNumber, genericString, stringSet };
    }

    function splitLogicalObject(ft: Readonly<FloughTypei>): { logicalObject?: FloughLogicalObjectIF | undefined, remaining: FloughTypei } {
        castReadonlyFloughTypei(ft);
        if (ft.any || ft.unknown) return { remaining:ft };
        if (!ft.logicalObject) return { remaining:ft };
        const logicalObject = ft.logicalObject;
        const remaining = cloneTypeNobj(ft.nobj);
        // delete remaining.logicalObject;
        return {
            logicalObject,
            remaining: { nobj:remaining }
        };
    }

    function dbgFloughTypeNobjToStrings(nobj: Readonly<FloughTypeNobj>): string[] {
        const arr: string[] = [];
        for (const k in nobj){
            if (k==="string" || k==="number" || k==="bigint") {
                let str = "nobj."+k;
                if (nobj[k]===true) str+=":true";
                else {
                    str+=":{";
                    const set = nobj[k] as Set<LiteralType>;
                    let first = true;
                    set.forEach((v)=>{
                        if (first) first = false;
                        else str+=",";
                        str+=dbgsModule.dbgTypeToString(v);
                    });
                    str+="}";
                }
                arr.push(str);
            }
            else {
                if ((nobj as Record<string,boolean>)[k]) arr.push("nobj."+k+":true");
            }
        }
        return arr;
    }

    function dbgFloughTypeToStrings(ft: Readonly<FloughType>): string[] {
        castReadonlyFloughTypei(ft);
        if (isNeverType(ft)) return ["never"];
        if (isAnyType(ft)) return ["any"];
        if (isUnknownType(ft)) return ["unknown"];
        const arr: string[] = dbgFloughTypeNobjToStrings(ft.nobj);
        // for (const k in nobj){
        //     if (k==="string" || k==="number" || k==="bigint") {
        //         let str = "nobj."+k;
        //         if (nobj[k]===true) str+=":true";
        //         else {
        //             str+=":{";
        //             const set = nobj[k] as Set<LiteralType>;
        //             let first = true;
        //             set.forEach((v)=>{
        //                 if (first) first = false;
        //                 else str+=",";
        //                 str+=dbgsModule.dbgTypeToString(v);
        //             });
        //             str+="}";
        //         }
        //         arr.push(str);
        //     }
        //     else {
        //         if ((nobj as Record<string,boolean>)[k]) arr.push("nobj."+k+":true");
        //     }
        // }
        if (ft.logicalObject) {
            floughLogicalObjectModule.dbgLogicalObjectToStrings(ft.logicalObject).forEach((s)=>arr.push("logicalObject:"+s));
        }
        return arr;
    }
    function dbgFloughTypeToString(ft: Readonly<FloughType>): string {
        castReadonlyFloughTypei(ft);
        const tstype = getTsTypeFromFloughType(ft);
        return dbgsModule.dbgTypeToString(tstype);
    }

}
