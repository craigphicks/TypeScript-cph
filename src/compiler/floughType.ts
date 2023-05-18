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
        intersectionOfRefTypesType(...args: Readonly<FloughType>[]): FloughType ;
        isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        subtractFromType(subtrahend: Readonly<FloughType>, minuend: Readonly<FloughType>, /* errorOnMissing = false */): FloughType ;
        getTypeFromRefTypesType(type: Readonly<FloughType>): Type ;
        isNeverType(type: Readonly<FloughType>): boolean ;
        isAnyType(type: Readonly<FloughType>): boolean ;
        isUnknownType(type: Readonly<FloughType>): boolean ;
        forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<FloughType>, f: F): void ;
        equalRefTypesTypes(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): void;
        partitionForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): PartitionForEqualityCompareItem[];
        dbgRefTypesTypeToStrings(type: Readonly<FloughType>): string[];
        // end of interface copied from RefTypesTypeModule

        /**
         * Prefered interface for FloughType
         * @param ft
         */
        //createFromTsTypeAndLogicalObject(tstype: Readonly<Type>, logicalObject: FloughLogicalObjectIF): FloughType;
        createFromTsType(tstype: Readonly<Type>, logicalObject?: FloughLogicalObjectIF): FloughType;
        unionWithTsTypeMutate(tstype: Readonly<Type>, ft: FloughType): FloughType;
        cloneType(ft: Readonly<FloughType>): FloughType;
        createNeverType(): FloughType;
        //isNeverType(ft: Readonly<FloughType>): boolean; // already defined above
        getNeverType(): Readonly<FloughType>;
        createNumberType(): Readonly<FloughType>;
        createUndefinedType(): Readonly<FloughType>;
        intersectionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        unionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        differenceWithFloughTypeMutate(subtrahend: Readonly<FloughType>, minuend: FloughType): FloughType;

        getTsTypesFromFloughType(ft: Readonly<FloughType>): Type[];
        intersectionWithObjectSimplification(...types: Readonly<FloughType>[]): FloughType;
        hasLogicalObject(ft: Readonly<FloughType>): boolean;
        getLogicalObject(ft: Readonly<FloughType>): FloughLogicalObjectIF | undefined;
        createTypeFromLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF> | undefined): FloughType ;
        //modifyFloughTypeObjectEffectiveDeclaredType(ft: Readonly<FloughType>, effectiveDeclaredType: Type): FloughType;

        widenTypeByEffectiveDeclaredType(ft: Readonly<FloughType>, effectiveDeclaredTsType: Readonly<Type>): FloughType;
        getLiteralNumberTypes(ft: Readonly<FloughType>): LiteralType[] | undefined;
        getLiteralStringTypes(ft: Readonly<FloughType>): LiteralType[] | undefined;
        hasNumberType(ft: Readonly<FloughType>, intrinsicNumberTypeOnly?: true): boolean;
        hasStringType(ft: Readonly<FloughType>, intrinsicStringTypeOnly?: true): boolean;

        dbgFloughTypeToStrings(type: Readonly<FloughType>): string[];
        dbgFloughTypeToString(type: Readonly<FloughType>): string;

    }


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
        intersectionOfRefTypesType(...args: Readonly<FloughType>[]): FloughType {
            if (args.length === 0) return createNeverType();
            castReadonlyFloughTypei(args[0]);
            let ft = cloneType(args[0]);
            args.slice(1).forEach((t,_i)=>{
                castReadonlyFloughTypei(t);
                ft = intersectionWithFloughTypeMutate(t,ft);
            });
            return ft;
        },
        // isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
        //     castReadonlyFloughTypei(a);
        //     castReadonlyFloughTypei(b);
        //     if (isNeverType(a)) return true;
        //     if (isNeverType(b)) return false;
        //     if (isAnyType(a)) return isAnyType(b) ? true : false;
        //     if (isUnknownType(a) || isAnyOrUnknownType(b)) return false; // too pessimistic?
        //     if (!isSubsetOfFloughTypeNobj(a.nobj,b.nobj)) return false;
        //     if (a.logicalObject) {
        //         if (!b.logicalObject) return false; // TODO: alothough a.logicalObject might be a deep postponed never type in which case true would be correct.
        //         // this gets complicated. Is it valid to postpone, and what is the correct result to return here when postponing?
        //         return true;
        //     }
        //     return true;
        // },
        isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
            // The above commented out code should give the same answer but maybe be faster.  But this is more simple. TODO: compare performance.
            castReadonlyFloughTypei(a);
            castReadonlyFloughTypei(b);
            const diff = differenceWithFloughTypeMutate(b,cloneType(a));
            return isNeverType(diff);
        },
        subtractFromType(subtrahend: Readonly<FloughType>, minuend: Readonly<FloughType>, /* errorOnMissing = false */): FloughType {
            castReadonlyFloughTypei(subtrahend);
            castReadonlyFloughTypei(minuend);
            return differenceWithFloughTypeMutate(subtrahend,cloneType(minuend));
        },
        getTypeFromRefTypesType(type: Readonly<FloughType>): Type {
            castReadonlyFloughTypei(type);
            return getTsTypeFromFloughType(type);
        },
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
        partitionForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): PartitionForEqualityCompareItemTpl<FloughType>[] {
            return partitionForEqualityCompareFloughType(a,b);
        },

        // end of interface copied from RefTypesTypeModule


        dbgRefTypesTypeToStrings(type: Readonly<FloughType>): string[] {
            castReadonlyFloughTypei(type);
            return dbgFloughTypeToStrings(type);
        },
        getTsTypesFromFloughType,
        intersectionWithObjectSimplification,
        hasLogicalObject,
        getLogicalObject,
        createTypeFromLogicalObject,
        widenTypeByEffectiveDeclaredType,
        createFromTsType,
        unionWithTsTypeMutate,
        cloneType,
        differenceWithFloughTypeMutate,
        intersectionWithFloughTypeMutate,
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



    //export const floughTypeModule = floughTypeModuleTmp;

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

    // @ts-expect-error
    function castFloughType(ft: FloughType): asserts ft is FloughTypei {}

    function createNeverType(): FloughTypei {
        return { nobj:{} };
    }
    function createAnyType(): FloughTypei {
        return { any: true, nobj:{} };
    }
    function createUnknownType(): FloughTypei {
        return { unknown: true, nobj:{} };
    }

    function cloneTypeNobj(ft: Readonly<FloughTypeNobj>): FloughTypeNobj {
        const ft1 = { ...ft };
        if (ft1.string && ft1.string !== true) ft1.string = new Set(ft1.string);
        if (ft1.number && ft1.number !== true) ft1.number = new Set(ft1.number);
        if (ft1.bigint && ft1.bigint !== true) ft1.bigint = new Set(ft1.bigint);
        return ft1;
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

    function getTsTypeFromFloughType(ft: Readonly<FloughTypei>): Type {
        if (ft.any) return checker.getAnyType();
        if (ft.unknown) return checker.getUnknownType();
        const at = getTsTypesFromFloughTypeNobj(ft.nobj);
        // Now for the objects.
        if (ft.logicalObject) {
            at.push(floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(ft.logicalObject));
        }
        if (at.length === 0) return checker.getNeverType();
        if (at.length === 1) return at[0];
        return checker.getUnionType(at);
    }
    function getTsTypesFromFloughType(ft: Readonly<FloughTypei>): Type[] {
        if (ft.any) return [checker.getAnyType()];
        if (ft.unknown) return [checker.getUnknownType()];
        const at = getTsTypesFromFloughTypeNobj(ft.nobj);
        // Now for the objects.
        if (ft.logicalObject) {
            // TODO: return nonunion types?
            at.push(floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(ft.logicalObject));
        }
        if (at.length === 0) return [checker.getNeverType()];
        return at;
    }

    function intersectionWithObjectSimplification(types: [Readonly<FloughType>,Readonly<FloughType>]): FloughType {
        //if (types.length === 0) return createNeverType();
        castReadonlyFloughTypei(types[0]);
        const arrlogobj: FloughLogicalObjectIF[] = [];
        let blogobj = false;
        let ft = cloneType(types[0]);
        if (ft.logicalObject) {
            blogobj = true;
            arrlogobj.push(ft.logicalObject);
            delete ft.logicalObject;
        }
        for (let i=1; i<types.length; i++) {
            if (isNeverType(ft) && !blogobj) return ft;
            const t = types[i];
            castReadonlyFloughTypei(t);
            if (t.logicalObject) {
                if (blogobj) arrlogobj.push(t.logicalObject);
            }
            else if (blogobj) blogobj = false;
            // t.logicalObject will be elided in intersectionWithFloughTypeMutate because ft has no logical object.
            ft = intersectionWithFloughTypeMutate(t,ft);
        };
        if (!blogobj) return ft;
        ft.logicalObject = floughLogicalObjectModule.intersectionAndSimplifyLogicalObjects(types[0],types[1]); // note that this may return undefined.
        if (!ft.logicalObject) delete ft.logicalObject; // delete the undefined member.
        return ft;
    }

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

    function createFromTsType(tstype: Readonly<Type>): FloughTypei {
        return unionWithTsTypeMutate(tstype, createNeverType());
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
                if (!logicalObject) {
                    logicalObject = floughLogicalObjectModule.createFloughLogicalObjectPlain(t as ObjectType);
                }
                else{
                    logicalObject = floughLogicalObjectModule.unionOfFloughLogicalObject(logicalObject, floughLogicalObjectModule.createFloughLogicalObjectPlain(t as ObjectType));
                }
                return;
            }
            if (t.flags & TypeFlags.Union) {
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
                t.types.forEach(tsub => {
                    if (hasAny || hasUnknown) return;
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(floughLogicalObjectModule.createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const ftsub  = createFromTsType(tsub);
                        if (ftsub.any || ftsub.unknown) {
                            if (ftsub.any) hasAny=true;
                            if (ftsub.unknown) hasUnknown=true;
                            return;
                        }
                        const {logicalObject:logicalObjectSub, nobj: nobjSub} = ftsub;
                        nobj = unionWithFloughTypeNobjMutate(nobjSub, nobj);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                    else doUnionOne(tsub, /* expectOnlyPrimitive */ true);
                });
                if (hasAny||hasUnknown) {
                    if (hasAny) ftin = createAnyType();
                    if (hasUnknown) ftin = createUnknownType();
                    return;
                }
                if (arrlogobj.length!==0) {
                    const logobj = floughLogicalObjectModule.createFloughLogicalObjectTsunion(t,arrlogobj);
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
        if (ft0.unknown||ft1.unknown) return createUnknownType();
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

    function intersectionWithFloughTypeMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei): FloughTypei {
        if (ft0.any && ft1.any) return ft0;
        if (ft0.unknown && ft1.unknown) return ft0;
        if (ft0.any) return ft1;
        if (ft1.any) return ft0;
        if (ft0.unknown) return ft1;
        if (ft1.unknown) return ft0;
        ft1.nobj = intersectionWithFloughTypeNobjMutate(ft0.nobj, ft1.nobj);
        if (!ft0.logicalObject){
            delete ft1.logicalObject; // no error if not present
        }
        else if (ft1.logicalObject) {
            ft1.logicalObject = floughLogicalObjectModule.intersectionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
        }
        return ft1;
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
            minuend.logicalObject = floughLogicalObjectModule.differenceOfFloughLogicalObject(subtrahend.logicalObject, minuend.logicalObject);
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

        // if (subtrahend.string && minuend.string) {
        //     if (subtrahend.string===true) delete minuend.string;
        //     else if (minuend.string!==true){
        //         subtrahend.string.forEach((v)=>{
        //             (minuend.string as Set<LiteralType>).delete(v);
        //         });
        //     }
        // }
        // if (subtrahend.number && minuend.number) {
        //     if (subtrahend.number===true) delete minuend.number;
        //     else if (minuend.number!==true){
        //         subtrahend.number.forEach((v)=>{
        //             (minuend.number as Set<LiteralType>).delete(v);
        //         });
        //         if (minuend.number.size===0) delete minuend.number;
        //     }
        // }
        // if (subtrahend.bigint && minuend.bigint) {
        //     if (subtrahend.bigint===true) delete minuend.bigint;
        //     else if (minuend.bigint!==true){
        //         subtrahend.bigint.forEach((v)=>{
        //             (minuend.bigint as Set<LiteralType>).delete(v);
        //         });
        //     }
        // }
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

    // @ts-expect-error
    function isSubsetOfFloughTypeNobj(subset: Readonly<FloughTypeNobj>, superset: Readonly<FloughTypeNobj>): boolean {
        if (subset.boolFalse && !superset.boolFalse) return false;
        if (subset.boolTrue && !superset.boolTrue) return false;
        if (subset.symbol && !superset.symbol) return false;
        if (subset.uniqueSymbol && !superset.uniqueSymbol) return false;
        if (subset.null && !superset.null) return false;
        if (subset.undefined && !superset.undefined) return false;
        if (subset.void && !superset.void) return false;
        if (subset.string) {
            if (!superset.string) return false;
            if (subset.string===true){
                if (superset.string!==true) return false;
            }
            else if (superset.string!==true){
                for (let iter = subset.string.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!superset.string.has(it.value)) return false;
                }
            }
        }
        if (subset.number) {
            if (!superset.number) return false;
            if (subset.number===true){
                if (superset.number!==true) return false;
            }
            else if (superset.number!==true){
                for (let iter = subset.number.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!superset.number.has(it.value)) return false;
                }
            }
        }
        if (subset.bigint) {
            if (!superset.bigint) return false;
            if (subset.bigint===true){
                if (superset.bigint!==true) return false;
            }
            else if (superset.bigint!==true){
                for (let iter = subset.bigint.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!superset.bigint.has(it.value)) return false;
                }
            }
        }
        return true;
    }

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

    type PartitionNobj = & {
        both?: FloughTypeNobj;
        left?: FloughTypeNobj;
        right?: FloughTypeNobj;
        bothts?: Type;
        leftts?: Type[];
        rightts?: Type[];
        leftobj?: undefined | FloughLogicalObjectIF;
        rightobj?: undefined | FloughLogicalObjectIF;
        true?: boolean;
        false?: boolean;
    };

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

    function partitionForEqualityCompareFloughTypeNobj(
        a: Readonly<FloughTypeNobj>, b: Readonly<FloughTypeNobj>,
        blogobj: FloughLogicalObjectIF | undefined,
        pass: 0 | 1, symset: Set<string | LiteralType>):
    PartitionNobj[] {
        const arr: PartitionNobj[] = [];
        //const both = intersectionWithFloughTypeNobjMutate(a,cloneTypeNobj(b));
        //const neither = differenceWithFloughTypeNobjMutate(both,cloneTypeNobj(a));
        const bcount = itemCountFloughTypeNobj(b) + (blogobj ? 1 : 0);
        // TODO: f1 is simpler to write, but expanding out each case would probably be faster
        function f1(k: string){
            assertCastType<Record<string,boolean>>(a);
            assertCastType<Record<string,boolean>>(b);
            if (a[k]) {
                if (b[k]) {
                    if (pass===0) {
                        arr.push({ both:{ [k]:true }, true:true, false:true });
                        symset.add(k);
                    }
                    else if (!symset.has(k)) {
                        arr.push({ both:{ [k]:true }, true:true, false:true });
                    }
                    if (bcount>1){
                        const bd = cloneTypeNobj(b) as Record<string,boolean>;
                        delete bd[k];
                        arr.push({ left: { [k]:true }, right:bd, rightobj: blogobj, false:true });
                    }
                }
                else {
                    arr.push({ left: { [k]:true }, right:b, rightobj: blogobj, false:true });
                }
            }
        }
        f1("boolFalse");
        f1("boolTrue");
        f1("symbol");
        f1("uniqueSymbol");
        f1("null");
        f1("undefined");
        f1("void");

        function f2(k: "string" | "number" | "bigint"){
            const ak = a[k];
            const bk = b[k];
            if (ak) {
                if (ak===true) {
                    if (bk) {
                        if (bk===true){
                            if (pass===0) {
                                arr.push({ both:{ [k]:true }, true:true, false:true });
                                symset.add(k);
                            }
                            else if (!symset.has(k)) {
                                arr.push({ both:{ [k]:true }, true:true, false:true });
                            }
                            if (bcount>1){
                                const bd = cloneTypeNobj(b) as Record<string,undefined | true | Set<LiteralType>>;
                                delete bd[k];
                                arr.push({ left: { [k]:true }, right:bd, rightobj: blogobj, false:true });
                            }
                        }
                        else { // ak is true, bk is a set
                            arr.push({ left:{ [k]: true }, right:{ [k]:new Set<LiteralType>(bk) }, true:true, false:true });
                            const bd = cloneTypeNobj(b) as Record<string,undefined | true | Set<LiteralType>>;
                            delete bd[k];
                            if (blogobj || itemCountFloughTypeNobj(bd)>0) {
                                arr.push({ left:{ [k]: true }, right:bd, rightobj: blogobj, false:true });
                            }
                        }
                    }
                    else {
                        arr.push({ left:{ [k]:true }, right:b, rightobj: blogobj, false:true });
                    }
                }
                else {
                    ak.forEach((v)=>{
                        if (bk) {
                            if (bk===true){
                                if (pass===0) {
                                    arr.push({ bothts:v, true:true });
                                    symset.add(v);
                                }
                                else if (!symset.has(v)) {
                                    arr.push({ bothts:v, true:true });
                                }
                                // cannot subtract v from b
                                arr.push({ leftts:[v], right:b, rightobj: blogobj, false:true });
                            }
                            else {
                                if (bk.has(v)){
                                    arr.push({ bothts:v, true:true });
                                    if (bcount>1){
                                        const bd = cloneTypeNobj(b);
                                        (bd[k]! as Set<LiteralType>).delete(v);
                                        arr.push({ leftts:[v], right:bd, rightobj: blogobj, false:true });
                                    }
                                }
                                else {
                                    arr.push({ leftts:[v], right:b, rightobj: blogobj, false:true });
                                }
                            }
                        }
                        else {
                            arr.push({ leftts:[v], right:b, rightobj: blogobj, false:true });
                        }
                    });
                }
            }
        } // end of f2
        f2("string");
        f2("number");
        f2("bigint");
        if (pass===1){
            // swap left* and right*
            for (const p of arr){
                if (p.left||p.right) {
                    const t = p.left;
                    p.left = p.right;
                    p.right = t;
                }
                if (p.leftts||p.rightts) {
                    const t = p.leftts;
                    p.leftts = p.rightts;
                    p.rightts = t;
                }
                if (p.leftobj||p.rightobj) {
                    const t = p.leftobj;
                    p.leftobj = p.rightobj;
                    p.rightobj = t;
                }
            }
        }
        return arr;
    }


    function partitionForEqualityCompareFloughType(ai: Readonly<FloughType>, bi: Readonly<FloughType>): PartitionForEqualityCompareItemTpl<FloughType>[] {
        castReadonlyFloughTypei(ai);
        castReadonlyFloughTypei(bi);
        if (isNeverType(ai)||isNeverType(bi)) return [];
        if (isAnyType(ai) || isUnknownType(ai) || isAnyType(bi) || isUnknownType(bi)) return [{ left:ai,right:bi, true:true,false:true }];

        const leftTsType = ai.logicalObject ? floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(ai.logicalObject) : undefined;
        const rightTsType = bi.logicalObject ? floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(bi.logicalObject) : undefined;


        const symset = new Set<string | LiteralType>();
        const partnobj0 = partitionForEqualityCompareFloughTypeNobj(ai.nobj,bi.nobj,bi.logicalObject,0,symset);
        const partnobj1 = partitionForEqualityCompareFloughTypeNobj(bi.nobj,ai.nobj,ai.logicalObject,1,symset);
        const partnobj = partnobj0.concat(partnobj1);
        const partarr: PartitionForEqualityCompareItemTpl<FloughType>[] = [];
        for (const pn of partnobj){
            const pi: PartitionForEqualityCompareItemTpl<FloughType> = { true:pn.true, false:pn.false };
            if (pn.both) pi.both = { nobj:pn.both };
            if (pn.left) pi.left = { nobj:pn.left };
            if (pn.right) pi.right = { nobj:pn.right };

            if (pn.bothts) pi.bothts = pn.bothts;
            if (pn.leftts) pi.leftts = pn.leftts;
            if (pn.rightts) pi.rightts = pn.rightts;

            if (leftTsType) pi.leftts ? pi.leftts.push(leftTsType) : pi.leftts = [leftTsType];
            if (rightTsType) pi.rightts ? pi.rightts.push(rightTsType) : pi.rightts = [rightTsType];
            partarr.push(pi);
        }
        if (leftTsType && rightTsType) {
            const subtLofR = checker.isTypeRelatedTo(leftTsType, rightTsType, checker.getRelations().subtypeRelation);
            const subtRofL = checker.isTypeRelatedTo(rightTsType, leftTsType, checker.getRelations().subtypeRelation);
            const sometimesEqual = subtLofR || subtRofL;
            partarr.push({ leftts:[leftTsType], rightts:[rightTsType], true:sometimesEqual, false:true });
        }
        return partarr;
    }

    function hasLogicalObject(ft: Readonly<FloughType>): boolean {
        castReadonlyFloughTypei(ft);
        return ft.logicalObject!==undefined;
    }
    function getLogicalObject(ft: Readonly<FloughType>): FloughLogicalObjectIF | undefined {
        castReadonlyFloughTypei(ft);
        return ft.logicalObject;
    }
    function createTypeFromLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF>): FloughTypei {
        return { nobj:{}, logicalObject };
    }

    // deprecated
    // function modifyFloughTypeObjectEffectiveDeclaredType(ft: Readonly<FloughType>, effectiveDeclaredType: Type): FloughTypei {
    //     castReadonlyFloughTypei(ft);
    //     if (ft.logicalObject===undefined) return ft;
    //     const logicalObject = modifyFloughLogicalObjectEffectiveDeclaredType(ft.logicalObject, effectiveDeclaredType, { doNotWidenPropertyTypes:true });
    //     return { nobj: ft.nobj, logicalObject };
    // }
    function widenTypeByEffectiveDeclaredType(ftin: Readonly<FloughType>, effectiveDeclaredTsType: Readonly<Type>): FloughType {
        castReadonlyFloughTypei(ftin);
        if (isAnyType(ftin) || isUnknownType(ftin)) return ftin;
        //let ft: FloughTypei | undefined; // = cloneType(ftin);
        // const fn1 = (k: "string" | "number" | "bigint"): void => {
        //     if (ftin.nobj[k] && ftin.nobj[k]!==true) {
        //         if (ft===undefined) ft = cloneType(ftin);
        //         ft.nobj[k]=true;
        //     }
        // };

        if (!compilerOptions.floughDoNotWidenNonObject){
            return createFromTsType(effectiveDeclaredTsType);
        }
        else {
            const logicalObject = ftin.logicalObject;
            if (!logicalObject) return ftin;
            return {
                ...ftin,
                logicalObject: floughLogicalObjectModule.modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject, effectiveDeclaredTsType)
            };
        }
        // if (!compilerOptions.floughDoNotWidenNonObject){
        //     fn1("string");
        //     fn1("number");
        //     fn1("bigint");
        //     if (ftin.nobj.boolFalse !== ftin.nobj.boolTrue) {
        //         if (ft===undefined) ft = cloneType(ftin);
        //         ft.nobj.boolFalse = true;
        //         ft.nobj.boolTrue = true;
        //     }
        // }
        // if (ftin.logicalObject){
        //     if (compilerOptions.floughDoNotWidenLogicalObject){
        //         if (ft===undefined) ft = cloneType(ftin);
        //         ft.logicalObject = modifyFloughLogicalObjectEffectiveDeclaredType(ftin.logicalObject, effectiveDeclaredTsType, { doNotWidenPropertyTypes:true });
        //     }
        //     else {
        //         if (ft===undefined) ft = cloneType(ftin);
        //         ft.logicalObject = createFloughLogicalObject(effectiveDeclaredTsType);
        //     }
        // }
        // return ft ?? ftin;
    }


    function dbgFloughTypeToStrings(ft: Readonly<FloughType>): string[] {
        castReadonlyFloughTypei(ft);
        if (isNeverType(ft)) return ["never"];
        if (isAnyType(ft)) return ["any"];
        if (isUnknownType(ft)) return ["unknown"];
        const arr: string[] = [];
        const nobj = ft.nobj;
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
