namespace ts {

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
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): FloughType;
        partitionForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): PartitionForEqualityCompareItem[];
        // end of interface copied from RefTypesTypeModule

        /**
         * Prefered interface for FloughType
         * @param ft
         */
        createFromTsType(tstype: Readonly<Type>): FloughType;
        unionWithTsTypeMutate(tstype: Readonly<Type>, ft: FloughType): FloughType;
        cloneType(ft: Readonly<FloughType>): FloughType;
        createNeverType(): FloughType;
        //isNeverType(ft: Readonly<FloughType>): boolean; // already defined above
        getNeverType(): Readonly<FloughType>;
        getNumberType(): Readonly<FloughType>;
        getUndefinedType(): Readonly<FloughType>;
        dbgFloughTypeToStrings(type: Readonly<FloughType>): string[];
        intersectionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        unionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        differenceWithFloughTypeMutate(subtrahend: Readonly<FloughType>, minuend: FloughType): FloughType;
    }


    //function castFloughTypei(ft: FloughType): asserts ft is FloughTypei {}
    function castReadonlyFloughTypei(_ft: FloughType): asserts _ft is Readonly<FloughTypei> {}


    const floughTypeModuleTmp: Partial<FloughTypeModule> = {
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
            checker.forEachType(tsType,f);
        },
        equalRefTypesTypes(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
            castReadonlyFloughTypei(a);
            castReadonlyFloughTypei(b);
            if (a === b) return true;
            if (isNeverType(a) && isNeverType(b)) return true;
            if (isAnyOrUnknownType(a)||isAnyOrUnknownType(b)) return false;
            if ((a.logicalObject||b.logicalObject) && a.logicalObject!==b.logicalObject) return false;
            return equalFloughTypesNonObj(a.nobj,b.nobj);
        },
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): FloughType {
            castReadonlyFloughTypei(type);
            return unionWithTsTypeMutate(tstype,type);
        },
        partitionForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): PartitionForEqualityCompareItemTpl<FloughType>[] {
            return partitionForEqualityCompareFloughType(a,b);
        }

        // end of interface copied from RefTypesTypeModule
    } as FloughTypeModule;

    export const floughTypeModule = floughTypeModuleTmp as FloughTypeModule;

    const checker = 0 as any as TypeChecker;

    export function initFloughTypeModule(checkerIn: TypeChecker): void {
        (checker as any) = checkerIn;
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
        return  !ft.any && !ft.unknown && !ft.logicalObject && isNeverTypeNobj(ft.nobj);
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
        if (ft.unknown) return checker.getAnyType();
        const at = getTsTypesFromFloughTypeNobj(ft.nobj);
        // Now for the objects.
        if (ft.logicalObject) {
            at.push(getTsTypeFromLogicalObject(ft.logicalObject));
        }
        if (at.length === 0) return checker.getNeverType();
        if (at.length === 1) return at[0];
        return checker.getUnionType(at);
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
                    if ((t as LiteralType).value){
                        nobj.boolTrue = true;
                    }
                    else {
                        nobj.boolFalse = true;
                    }
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
                nobj.void = true;
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
                    logicalObject = createFloughLogicalObjectPlain(t as ObjectType);
                }
                else{
                    logicalObject = unionOfFloughLogicalObject(logicalObject, createFloughLogicalObjectPlain(t as ObjectType));
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
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const ftsub  = createFromTsType(tsub);
                        if (ftsub.any || ftsub.unknown) {
                            if (ftsub.any) hasAny=true;
                            if (ftsub.unknown) hasUnknown=true;
                            return;
                        }
                        const {logicalObject:logicalObjectSub, nobj: nobjSub} = ftsub;
                        nobj = unionWithFloughTypeNonObjMutate(nobjSub, nobj);
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
                    const logobj = createFloughLogicalObjectTsunion(t,arrlogobj);
                    if (!logicalObject) {
                        logicalObject = logobj;
                    }
                    else {
                        logicalObject = unionOfFloughLogicalObject(logicalObject, logobj);
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
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const {logicalObject:logicalObjectSub, nobj:nobjSub}  = createFromTsType(tsub);
                        if (!nobjSubjIsect) nobjSubjIsect = nobjSub;
                        else nobjSubjIsect = intersectionWithFloughTypeNonObjMutate(nobjSub, nobjSubjIsect);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                    else {
                        const {logicalObject:logicalObjectSub, nobj:nobjSub}  = createFromTsType(tsub);
                        if (!nobjSubjIsect) nobjSubjIsect = nobjSub;
                        else nobjSubjIsect = intersectionWithFloughTypeNonObjMutate(nobjSub, nobjSubjIsect);
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
                    nobj = unionWithFloughTypeNonObjMutate(nobjSubjIsect, nobj);
                }
                if (arrlogobj.length!==0) {
                    const logobj = createFloughLogicalObjectTsintersection(t,arrlogobj);
                    if (!logicalObject) {
                        logicalObject = logobj;
                    }
                    else {
                        logicalObject = unionOfFloughLogicalObject(logicalObject, logobj);
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
        ft1.nobj = unionWithFloughTypeNonObjMutate(ft0.nobj, ft1.nobj);
        if (ft0.logicalObject){
            if (ft1.logicalObject) {
                ft1.logicalObject = unionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
            }
            else {
                ft1.logicalObject = ft0.logicalObject;
            }
        }
        return ft1;
    }
    function unionWithFloughTypeNonObjMutate(ft0: Readonly<FloughTypeNobj>, ft1: FloughTypeNobj): FloughTypeNobj {
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
        if (ft0.any||ft1.any) return createAnyType();
        if (ft0.unknown) return ft1;
        if (ft1.unknown) return ft0;
        ft1.nobj = intersectionWithFloughTypeNonObjMutate(ft0.nobj, ft1.nobj);
        if (!ft0.logicalObject){
            delete ft1.logicalObject; // no error if not present
        }
        else if (ft1.logicalObject) {
            ft1.logicalObject = intersectionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
        }
        return ft1;
    }
    function intersectionWithFloughTypeNonObjMutate(ft0: Readonly<FloughTypeNobj>, ft1: FloughTypeNobj): FloughTypeNobj {
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
        if (minuend.any) return minuend;
        if (subtrahend.any) return createNeverType();
        if (subtrahend.unknown) return createNeverType();
        if (minuend.unknown) return minuend;
        minuend.nobj = differenceWithFloughTypeNobjMutate(subtrahend.nobj, minuend.nobj);
        if (subtrahend.logicalObject && minuend.logicalObject) {
            minuend.logicalObject = differenceOfFloughLogicalObject(subtrahend.logicalObject, minuend.logicalObject);
        }
        return minuend;
    }
    function differenceWithFloughTypeNobjMutate(subtrahend: Readonly<FloughTypeNobj>, minuend: FloughTypeNobj): FloughTypeNobj {
        if (isNeverTypeNobj(subtrahend)) return minuend;
        if (isNeverTypeNobj(minuend)) return {};
        if (subtrahend.string && minuend.string) {
            if (subtrahend.string===true) delete minuend.string;
            else if (minuend.string!==true){
                subtrahend.string.forEach((v)=>{
                    (minuend.string as Set<LiteralType>).delete(v);
                });
            }
        }
        if (subtrahend.number && minuend.number) {
            if (subtrahend.number===true) delete minuend.number;
            else if (minuend.number!==true){
                subtrahend.number.forEach((v)=>{
                    (minuend.number as Set<LiteralType>).delete(v);
                });
            }
        }
        if (subtrahend.bigint && minuend.bigint) {
            if (subtrahend.bigint===true) delete minuend.bigint;
            else if (minuend.bigint!==true){
                subtrahend.bigint.forEach((v)=>{
                    (minuend.bigint as Set<LiteralType>).delete(v);
                });
            }
        }
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

    function equalFloughTypesNonObj(a: Readonly<FloughTypeNobj>, b: Readonly<FloughTypeNobj>): boolean {
        if (a.boolFalse!==b.boolFalse) return false;
        if (a.boolTrue!==b.boolTrue) return false;
        if (a.symbol!==b.symbol) return false;
        if (a.uniqueSymbol!==b.uniqueSymbol) return false;
        if (a.null!==b.null) return false;
        if (a.undefined!==b.undefined) return false;
        if (a.void!==b.void) return false;
        if (a.string) {
            if (!b.string) return false;
            if (a.string===true){
                if (b.string!==true) return false;
            }
            else if (b.string!==true){
                if (a.string.size!==b.string.size) return false;
                for (let iter = a.string.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!b.string.has(it.value)) return false;
                }
            }
        }
        if (a.number) {
            if (!b.number) return false;
            if (a.number===true){
                if (b.number!==true) return false;
            }
            else if (b.number!==true){
                if (a.number.size!==b.number.size) return false;
                for (let iter = a.number.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!b.number.has(it.value)) return false;
                }
            }
        }
        if (a.bigint) {
            if (!b.bigint) return false;
            if (a.bigint===true){
                if (b.bigint!==true) return false;
            }
            else if (b.bigint!==true){
                if (a.bigint.size!==b.bigint.size) return false;
                for (let iter = a.bigint.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!b.bigint.has(it.value)) return false;
                }
            }
        }
        return true;
    }

    type Partition = PartitionForEqualityCompareItemTpl<FloughType>;
    function partitionForEqualityCompareFloughType(a: Readonly<FloughType>, b: Readonly<FloughType>): Partition[] {
        castReadonlyFloughTypei(a);
        castReadonlyFloughTypei(b);
        if (isNeverType(a)||isNeverType(b)) return [];
        if (isAnyType(a) || isUnknownType(a) || isAnyType(b) || isUnknownType(b)) return [{ left:a,right:b, true:true,false:true }];
        return 0 as any as Partition[];
        // const symmSet = new Set<Type>();

        // const doOneSide = (x: Readonly<FloughType>, y: Readonly<FloughType>, pass: 0 | 1): Partition[] => {
        //     const arrYTsTypes: Type[] = getTsTypesOfType(y);
        //     const setYTsTypes = new Set<Type>(arrYTsTypes);
        //     const copySetYDelete=(d: Type) => {
        //         const r = new Set(setYTsTypes);
        //         r.delete(d);
        //         const a: Type[] = [];
        //         r.forEach(t=>a.push(t));
        //         return a;
        //     };
        //     const arr1: PartitionForEqualityCompareItem[] = [];
        //     // @ts-expect-error mask
        //     const a = undefined;
        //     // @ts-expect-error mask
        //     const b = undefined;
        //     x._mapLiteral?.forEach((setltx,tx)=>{
        //         const setlty = y._mapLiteral?.get(tx);
        //         if (setlty){
        //             setltx.forEach(ltx=>{
        //                 if (setlty.has(ltx)){
        //                     if (pass===0){
        //                         arr1.push({ bothts:ltx, true:true });
        //                         symmSet.add(ltx);
        //                     }
        //                     else if (!symmSet.has(ltx)){
        //                         arr1.push({ bothts:ltx, true:true });
        //                     }
        //                     const rightts = copySetYDelete(ltx);
        //                     if (rightts.length!==0) {
        //                         arr1.push({ leftts:[ltx], rightts, false:true });
        //                     }
        //                 }
        //                 else {
        //                     // both x and y have literals under ta, but only x has lta under ta
        //                     arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
        //                 }
        //             });
        //         }
        //         else if (y._set?.has(tx)){
        //             // e.g. ltx is 1, and y is number
        //             setltx.forEach(ltx=>{
        //                 if (pass===0){
        //                     arr1.push({ bothts:ltx, true:true });
        //                     symmSet.add(ltx);
        //                 }
        //                 else if (!symmSet.has(ltx)){
        //                     arr1.push({ bothts:ltx, true:true });
        //                 }
        //                 // // cannot subtract singular from nonsingular so the inverse of right is just right, and although it matches just label as false only.
        //                 arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
        //             });
        //         }
        //         else {
        //             setltx.forEach(ltx=>{
        //                 arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
        //             });
        //         }
        //     });
        //     x._set!.forEach(tx=>{
        //         if (y._set!.has(tx)){
        //             if (pass===0){
        //                 arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
        //                 symmSet.add(tx);
        //             }
        //             else if (!symmSet.has(tx)){
        //                 arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
        //             }
        //             const rightts = copySetYDelete(tx);
        //             if (rightts.length!==0){
        //                 arr1.push({ leftts:[tx], rightts });
        //             }
        //         }
        //         else {
        //             arr1.push({ leftts:[tx], rightts:arrYTsTypes, false:true });
        //         }
        //     });
        //     if (pass===1) {
        //         arr1.forEach(x=>{
        //             if (x.leftts){
        //                 const tmp = x.leftts;
        //                 x.leftts = x.rightts;
        //                 x.rightts = tmp;
        //             }
        //         });
        //     }
        //     return arr1;
        // };
        // const ret = [ ...doOneSide(a,b,0), ...doOneSide(b,a,1) ];
        // return ret;
    }

}
