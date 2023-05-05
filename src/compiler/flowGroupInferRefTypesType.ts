namespace ts {
    export function debugAssert(
        _expression: unknown, _message?: string /*, _verboseDebugInfo?: string | (() => string), _stackCrawlMark?: AnyFunction*/
    ): asserts _expression {
        return Debug.assert(arguments);
    }

    export enum RefTypesTableKind {
        leaf = "leaf",
        nonLeaf = "nonLeaf",
        return = "return"
    };
    // declare function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn;
    export enum RefTypesTypeFlags {
        none=0,
        any=1,
        unknown=2,
    };
    /**
     * Any RefTypesType below an intersection or union will contain only objects.
     * An _intersection and _union will not both exist together in the same RefTypesType.
     *
     */
    export interface RefTypesTypeNormal {
        _flags: RefTypesTypeFlags.none;
        _set: Set<Type>; // also arrays and tuples
        _mapLiteral: ESMap<Type, Set<LiteralType>>;
        //_intersectionOfObjects?: RefTypesTypeNormal[];
        // _objects?: FloughObjectTypeInstance[];
        // _intersection?: RefTypesTypeNormal[];
        // _union?: RefTypesTypeNormal[];
        _logicalObject?: FloughLogicalObjectIF;
    };
    export interface RefTypesTypeAny {
        _flags: RefTypesTypeFlags.any;
        _set: undefined;
        _mapLiteral: undefined;
    };
    export interface RefTypesTypeUnknown {
        _flags: RefTypesTypeFlags.unknown;
        _set: undefined;
        _mapLiteral: undefined;
    };
    export type RefTypesType = RefTypesTypeNormal | RefTypesTypeAny | RefTypesTypeUnknown ;


    //export declare function partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[];


    export type RefTypesTypeModule = & {
        getRefTypesTypeNever: () => RefTypesType;
        getRefTypesTypeAny: () => RefTypesType;
        getRefTypesTypeUnknown: () => RefTypesType;
        getRefTypesTypeUndefined: () => RefTypesType;
        getRefTypesTypeString: () => RefTypesType;
        getRefTypesTypeNumber: () => RefTypesType;
        getRefTypesTypeBigInt: () => RefTypesType;
        //getRefTypesType: () => RefTypesType;
        //getTypeMemberCount(type: Readonly<RefTypesType>): number;
        forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void ;
        // createRefTypesTypeAny(): RefTypesTypeAny ;
        // createRefTypesTypeUnknown(): RefTypesTypeUnknown ;
        //createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): RefTypesType ;
        createRefTypesType(tstype?: Readonly<Type | FloughLogicalObjectIF> | Readonly<(Type | FloughLogicalObjectIF)[]>): RefTypesType;
        createRefTypesTypeNever(): RefTypesTypeNormal;
        cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType;
        //addTypesToRefTypesType({source,target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType ;
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: RefTypesType}): RefTypesType ;
        mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void ;
        unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType ;
        intersectionOfRefTypesType(...args: Readonly<RefTypesType>[]): RefTypesType ;
        differenceOfRefTypesType(minuend: Readonly<RefTypesType>, subtrahend: Readonly<RefTypesType>): RefTypesType ;
        subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>, /* errorOnMissing = false */): RefTypesType ;
        isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        getTypeFromRefTypesType(type: Readonly<RefTypesType>): Type ;
        isNeverType(type: Readonly<RefTypesType>): boolean ;
        isAnyType(type: Readonly<RefTypesType>): boolean ;
        isUnknownType(type: Readonly<RefTypesType>): boolean ;
        forEachRefTypesTypeTsTypeExcludingLogicalObject<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void ;
        forEachRefTypesTypeTsTypeIncludingLogicalObject<F extends (t: Type | FloughLogicalObjectIF) => any>(type: Readonly<RefTypesType>, f: F): void;
            //partitionIntoSingularAndNonSingularTypes(type: Readonly<RefTypesType>): {singular: RefTypesType, singularCount: number, nonSingular: RefTypesType, nonSingularCount: number};
        getMapLiteralOfRefTypesType(t: RefTypesType): Readonly<ESMap<Type,Readonly<Set<LiteralType>>>> | undefined;
        //getLiteralsOfANotInB(ta: Readonly<RefTypesType>, tb: Readonly<RefTypesType>): Readonly<ESMap<Type,Readonly<Set<LiteralType>>>> | undefined;
        //refTypesTypeNormalHasType(type: Readonly<RefTypesTypeNormal>, tstype: Readonly<Type>): boolean;
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        //literalWideningUnion(tunion: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        //getUnionOrWidenedType(told: Readonly<RefTypesType>, tnew: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        // widenLiteralsAccordingToEffectiveDeclaredType(type: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: RefTypesType): RefTypesType;
        partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[];
        unionOfFloughLogicalObjectToRefTypesTypeMutate(logicalObj: FloughLogicalObjectIF, target: RefTypesType): RefTypesType;
        intersectionOfFloughLogicalObjectToRefTypesTypeMutate(logicalObj: FloughLogicalObjectIF, target: RefTypesType): RefTypesType;
        hasLogicalObject(type: Readonly<RefTypesType>): boolean;
        getLogicalObject(type: Readonly<RefTypesType>): FloughLogicalObjectIF | undefined;
};

    export function createRefTypesTypeModule(checker: TypeChecker): RefTypesTypeModule {

        const neverTsType = checker.getNeverType();
        const anyTsType = checker.getAnyType();
        const unknownTsType = checker.getUnknownType();
        const undefinedTsType = checker.getUndefinedType();
        const stringTsType = checker.getStringType();
        const numberTsType = checker.getNumberType();
        const bigintTsType = checker.getBigIntType();

        const neverType = createRefTypesType(); // never
        const unknownType = createRefTypesType(unknownTsType);
        const undefinedType = createRefTypesType(undefinedTsType);
        const stringType = createRefTypesType(stringTsType);
        const numberType = createRefTypesType(numberTsType);
        const bigintType = createRefTypesType(bigintTsType);
        const anyType = createRefTypesType(anyTsType);


        // const trueType = checker.getTrueType();
        // const falseType = checker.getFalseType();
        // const undefinedType = checker.getUndefinedType();
        // const errorType = checker.getErrorType();
        // const nullType = checker.getNullType();
        // const refTypesRefNeverType: RefTypesType = {
        //     _flags: RefTypesTypeFlags.none,
        //     _set: new Set<Type>(),
        //     _mapLiteral: new Map<Type, Set<LiteralType>>()
        // };

        const {
            // dbgNodeToString,
            // dbgSignatureToString,
            // dbgSymbolToStringSimple,
            // dbgTypeToString,
            dbgTypeToStringDetail,
        } = createDbgs(checker);

        return {
            getRefTypesTypeNever,
            getRefTypesTypeAny,
            getRefTypesTypeUnknown,
            getRefTypesTypeUndefined,
            getRefTypesTypeString,
            getRefTypesTypeNumber,
            getRefTypesTypeBigInt,
                //getTypeMemberCount,
            forEachTypeIfUnion, //<F extends ((t: Type) => any)>(type: Type, f: F): void ;
            createRefTypesType,
            createRefTypesTypeNever,
            cloneRefTypesType,
            //addTypesToRefTypesType,
            addTypeToRefTypesType,
            mergeToRefTypesType,
            unionOfRefTypesType,
            intersectionOfRefTypesType,
            differenceOfRefTypesType,
            isASubsetOfB,
            subtractFromType,
            getTypeFromRefTypesType,
            isNeverType,
            isAnyType,
            isUnknownType,
            forEachRefTypesTypeTsTypeExcludingLogicalObject,
            forEachRefTypesTypeTsTypeIncludingLogicalObject,
            getMapLiteralOfRefTypesType,
            equalRefTypesTypes,
            //literalWideningUnion,
            //getUnionOrWidenedType,
            //widenLiteralsAccordingToEffectiveDeclaredType,
            addTsTypeNonUnionToRefTypesTypeMutate: addTsTypeNonCompoundToRefTypesTypeMutate,
            partitionForEqualityCompare,
            unionOfFloughLogicalObjectToRefTypesTypeMutate,
            intersectionOfFloughLogicalObjectToRefTypesTypeMutate,
            hasLogicalObject,
            getLogicalObject,
        };
        //const neverType = checker.getNeverType();

        // const neverTsType = checker.getNeverType();
        // const unknownTsType = checker.getUnknownType();
        // const stringTsType = checker.getStringType();
        // const numberTsType = checker.getNumberType();
        // const bigintTsType = checker.getBigIntType();
        // const anyTsType = checker.getAnyType();


        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeNever(): RefTypesType { return neverType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeUnknown(): RefTypesType { return unknownType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeUndefined(): RefTypesType { return undefinedType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeString(): RefTypesType { return stringType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeNumber(): RefTypesType { return numberType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeBigInt(): RefTypesType { return bigintType; }
        // eslint-disable-next-line max-statements-per-line
        function getRefTypesTypeAny(): RefTypesType { return anyType; }

        function forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void {
            (type.flags & TypeFlags.Union) ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        };
        function createRefTypesTypeAny(): RefTypesTypeAny {
            return { _flags: RefTypesTypeFlags.any, _set: undefined, _mapLiteral: undefined };
        }
        function createRefTypesTypeUnknown(): RefTypesTypeUnknown {
            return { _flags: RefTypesTypeFlags.unknown, _set: undefined, _mapLiteral: undefined };
        }

        function hasLogicalObject(type: Readonly<RefTypesType>): boolean {
            return (type as RefTypesTypeNormal)._logicalObject !== undefined;
        }
        function getLogicalObject(type: Readonly<RefTypesType>): FloughLogicalObjectIF | undefined{
            return (type as RefTypesTypeNormal)._logicalObject;
        }

        function unionOfFloughLogicalObjectToRefTypesTypeMutate(logicalObj: FloughLogicalObjectIF, target: RefTypesType): RefTypesType {
            if (target._flags & RefTypesTypeFlags.any) return target;
            if (target._flags & RefTypesTypeFlags.unknown) return target;
            assertCastType<RefTypesTypeNormal>(target);
            if (!target._logicalObject) target._logicalObject = logicalObj;
            else target._logicalObject = unionOfFloughLogicalObject(logicalObj, target._logicalObject);
            return target;
        }
        function intersectionOfFloughLogicalObjectToRefTypesTypeMutate(logicalObj: FloughLogicalObjectIF, target: RefTypesType): RefTypesType {
            if (target._flags & RefTypesTypeFlags.any) return target;
            if (target._flags & RefTypesTypeFlags.unknown) return target;
            assertCastType<RefTypesTypeNormal>(target);
            if (!target._logicalObject) target._logicalObject = logicalObj;
            else target._logicalObject = intersectionOfFloughLogicalObject(logicalObj, target._logicalObject);
            return target;
        }
        function addTsTypeNonCompoundToRefTypesTypeMutate(tstype: Type, type: RefTypesType): RefTypesType {
            Debug.assert(!(tstype.flags & (TypeFlags.Union|TypeFlags.Intersection)),"unexpected");
            if (tstype===neverTsType) return type;
            if (tstype===anyTsType || type._flags===RefTypesTypeFlags.any) {
                return createRefTypesTypeAny();
            }
            if (tstype===unknownTsType || type._flags===RefTypesTypeFlags.unknown) {
                return createRefTypesTypeUnknown();
            }
            // Note: boolean type is actually a union of true and false types.  Therefore
            // does not get treated as a literal here.
            /**
             * If the superset type of the literal type is already present, then the literal type is ignored.
             * E.g., If string type is present, then adding literal string type "something" will be a non op.
             */
            if (!(tstype.flags & TypeFlags.BooleanLiteral) && tstype.flags & TypeFlags.Literal) {
                let keyType: Type | undefined;
                let regularTsType: LiteralType | undefined;
                if (tstype.flags & TypeFlags.NumberLiteral) {
                    if (!type._set.has(numberTsType)){
                        keyType = numberTsType;
                        // TODO: could we just do tstype.regularType? Maybe not if it is an Enum.
                        regularTsType = checker.getNumberLiteralType((tstype as NumberLiteralType).value);
                    }
                }
                else if (tstype.flags & TypeFlags.StringLiteral){
                    if (!type._set.has(stringTsType)) {
                        keyType = stringTsType;
                        regularTsType = checker.getStringLiteralType((tstype as StringLiteralType).value);
                    }
                }
                else if (tstype.flags & TypeFlags.BigIntLiteral) {
                    if (!type._set.has(bigintTsType)) {
                        keyType = bigintTsType;
                        regularTsType = checker.getBigIntLiteralType((tstype as BigIntLiteralType).value);
                    }
                }
                else Debug.fail("unexpected: "+dbgTypeToStringDetail(tstype));

                if (keyType && regularTsType){
                    const got = type._mapLiteral.get(keyType);
                    if (!got) type._mapLiteral.set(keyType, new Set<LiteralType>([regularTsType]));
                    else got.add(regularTsType);
                }
            }
            else if (tstype.flags & TypeFlags.Object) {
                const logicalObj = createFloughLogicalObjectPlain(tstype as ObjectType);
                assertCastType<RefTypesTypeNormal>(type);
                if (!type._logicalObject) type._logicalObject = logicalObj;
                else type._logicalObject = unionOfFloughLogicalObject(logicalObj, type._logicalObject);
            }
            else {
                // The only other types coming in here should be the primitives:
                // stringType, numberType, bigintType, symbolType, uniqueSymbolType (?), voidType, undefinedType, nullType.
                const regularTsType = (tstype as any).regularType ? (tstype as any).regularType : tstype;
                // erase literals
                if (regularTsType.flags & (TypeFlags.Number|TypeFlags.String|TypeFlags.BigInt)){
                    // So these "numberType" etc are not their own regular types.  This always surprises me.
                    Debug.assert(regularTsType===numberTsType||regularTsType===stringTsType||regularTsType===bigintTsType, "unexpected");
                    type._mapLiteral.delete(regularTsType);
                }
                type._set.add(regularTsType);
            }
            return type;
        }

        function createRefTypesTypeNever(): RefTypesTypeNormal {
            return createRefTypesType() as RefTypesTypeNormal;
        }


        function createRefTypesType(tstype?: Readonly<Type | FloughLogicalObjectIF> | Readonly<(Type | FloughLogicalObjectIF)[]>): RefTypesType {
            // if (!tstype) return refTypesRefNeverType;
            if (Array.isArray(tstype)){
                return addTypesToRefTypesType({ source:tstype.slice(1), target:createRefTypesType(tstype[0]) });
            }
            const typeOut: RefTypesType = {
                _flags: RefTypesTypeFlags.none,
                _set: new Set<Type>(),
                _mapLiteral: new Map<Type, Set<LiteralType>>(),
            };
            if (!tstype) return typeOut;
            if (isFloughLogicalObject(tstype)) return unionOfFloughLogicalObjectToRefTypesTypeMutate(tstype, typeOut);
            return addTypeToRefTypesTypeMaybeMutate({ source:tstype as Readonly<Type>,target:typeOut });
        }
        function cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType{
            if (t._flags) return { _flags:t._flags, _set: undefined, _mapLiteral: undefined };
            const _mapLiterals = new Map<Type, Set<LiteralType>>();
            t._mapLiteral.forEach((set,key)=>{
                _mapLiterals.set(key,new Set<LiteralType>(set));
            });
            const r: RefTypesTypeNormal = {
                _flags: RefTypesTypeFlags.none,
                _set: new Set(t._set),
                _mapLiteral: _mapLiterals,
            };
            if (t._logicalObject) r._logicalObject = t._logicalObject; // ok because every operation on _logicalObject creates a new object.
            return r;
        }

        function addTypesToRefTypesType({source:at,target:target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType {
            at.forEach(t=>{
                target = addTypeToRefTypesTypeMaybeMutate({ source:t,target });
            });
            return target;
        }
        function addTypeToRefTypesTypeMaybeMutate({source:tstype,target:target}: { source: Readonly<Type>, target: Readonly<RefTypesType>}): RefTypesType {
            if (tstype.flags & TypeFlags.Union){
               (tstype as UnionType).types.forEach(t=>{
                    target = addTsTypeNonCompoundToRefTypesTypeMutate(t, target);
               });
            }
            else if (tstype.flags & TypeFlags.Intersection){
                Debug.fail("unexpected");
            }
            else {
                target = addTsTypeNonCompoundToRefTypesTypeMutate(tstype, target);
            }
            return target;
        }
        function addTypeToRefTypesType({source:tstype,target:targetIn}: { source: Readonly<Type>, target: Readonly<RefTypesType>}): RefTypesType {
            const targetOut = addTypeToRefTypesTypeMaybeMutate({ source:tstype,target:targetIn });
            if (targetOut === targetIn) return cloneRefTypesType(targetOut);
            return targetOut;
        }

        /**
         * This is not currently being used because it called from Constraints and that has been disabled until other issues are resolved.
         * @param param0 In place modification of target.
         * @returns void
         */
        function mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void {
            if (isNeverType(source)) return;
            if (isAnyType(source)){
                (target as any as RefTypesTypeAny)._flags = RefTypesTypeFlags.any;
                (target as any as RefTypesTypeAny)._set = undefined;
                (target as any as RefTypesTypeAny)._mapLiteral = undefined;
                return;
            }
            if (isAnyType(target)) return;
            if (isUnknownType(source)){
                (target as any as RefTypesTypeUnknown)._flags = RefTypesTypeFlags.unknown;
                (target as any as RefTypesTypeUnknown)._set = undefined;
                (target as any as RefTypesTypeAny)._mapLiteral = undefined;
                return;
            }
            if (isUnknownType(target)) return;
            // merge set to set, merge setLiteral to setLiteral
            // (source as RefTypesTypeNormal)._set.forEach(t=>{
            //    (target as RefTypesTypeNormal)._set.add(t);
            // });
            // (source as RefTypesTypeNormal)._setLiteral.forEach(t=>{
            //     (target as RefTypesTypeNormal)._setLiteral.add(t);
            // });
            Debug.assert(!source._flags);
            assertCastType<RefTypesTypeNormal>(source);
            assertCastType<RefTypesTypeNormal>(target);
            let tmpTarget = target;
            source._set.forEach(tstype=>{
                tmpTarget = addTypeToRefTypesTypeMaybeMutate({ source:tstype, target:tmpTarget }) as RefTypesTypeNormal;
            });
            source._mapLiteral.forEach((set,_key)=>{
                //tmpTarget = addTypeToRefTypesType({ source:tstype, target:tmpTarget });
                set.forEach(tsLiteralType=>{
                    tmpTarget = addTypeToRefTypesTypeMaybeMutate({ source:tsLiteralType, target:tmpTarget }) as RefTypesTypeNormal;
                });
            });
            target._flags = tmpTarget._flags;
            target._set = tmpTarget._set;
            target._mapLiteral = tmpTarget._mapLiteral;
        }

        function unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType {
            let hasUnknown = false;
            const target = createRefTypesTypeNever();//never
            for (const type of types){
                if (isAnyType(type)) {
                    return createRefTypesTypeAny();
                }
                if (isUnknownType(type)){
                    hasUnknown = true;
                    continue;
                }
                if (hasUnknown) continue;
                mergeToRefTypesType({ source:type, target });
            }
            if (hasUnknown) return createRefTypesTypeUnknown();
            return target;
        }

        function isectSet(x: Readonly<Set<Type>>,y: Readonly<Set<Type>>): [nonbj:Set<Type>] {
            const nonobj = new Set<Type>();
            //const ouiobj = new Set<Type>();
            if (y.size<x.size) [x,y]=[y,x];
            x.forEach(xt=>{
                // if (xt.flags & TypeFlags.Object){
                //     for (let iter = y.values(),y2 = iter.next();!y2.done;y2 = iter.next()){
                //         const yt = y2.value;
                //         if (checker.isTypeRelatedTo(xt,yt,checker.getRelations().identityRelation)) ouiobj.add(xt);
                //     }
                // }
                // else
                if (y.has(xt)) nonobj.add(xt);
            });
            return [nonobj/*,ouiobj*/];
        }

        function intersectRefTypesTypesAux(x: Readonly<RefTypesTypeNormal>, y: Readonly<RefTypesTypeNormal>, iset: Set<Type>, _mapLiteral: ESMap<Type, Set<LiteralType>>): void {
            x._mapLiteral.forEach((xmapset,tstype)=>{
                const ymapset = y._mapLiteral.get(tstype);
                xmapset.forEach(lt=>{
                    if ((ymapset && ymapset.has(lt))||y._set.has(tstype)){
                        let ltset = _mapLiteral.get(tstype);
                        if (!ltset){
                            ltset = new Set<LiteralType>([lt]);
                            _mapLiteral.set(tstype,ltset);
                        }
                        else ltset.add(lt);
                        iset.delete(tstype); // Note: this might not be necessary, but less is more, so leave it.
                    }
                });
            });
        }
        // @ts-expect-error
        function differenceOfRefTypesType(minuend: Readonly<RefTypesType>, subtrahend: Readonly<RefTypesType>): RefTypesType {
            // TODO: the implementation.
            return 0 as any as RefTypesType;
        }

        function intersectRefTypesTypes2(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            if (isAnyType(a)) return cloneRefTypesType(b); // TODO: check, and not need to clone
            if (isAnyType(b)) return cloneRefTypesType(a);
            // See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type
            // under intersection everying absords absorbs unknown
            if (isUnknownType(a)) return b;
            if (isUnknownType(b)) return a;
            //if (isUnknownType(a)||isUnknownType(b)) return createRefTypesTypeUnknown();
            // IWOZERE
            Debug.assert(!a._flags && !b._flags);
            const [isetnonobj/*,isetobj*/] = isectSet(a._set, b._set);
            const _mapLiteral = new Map<Type, Set<LiteralType>>();
            intersectRefTypesTypesAux(a,b,isetnonobj,_mapLiteral);
            intersectRefTypesTypesAux(b,a,isetnonobj,_mapLiteral);
            //if (isetobj.size) isetobj.forEach(t=>isetnonobj.add(t));
            let _logicalObject: FloughLogicalObjectIF | undefined;
            if (a._logicalObject && b._logicalObject) {
                _logicalObject = intersectionOfFloughLogicalObject(a._logicalObject, b._logicalObject);
            }
            return {
                _flags: RefTypesTypeFlags.none,
                _set: isetnonobj,
                _mapLiteral,
                ...(_logicalObject ? { _logicalObject } : {})
            };
        }
        function intersectionOfRefTypesType(...args: Readonly<RefTypesType>[]): RefTypesType {
            if (args.length===0) return createRefTypesTypeNever(); // never
            if (args.length===1) return args[0];
            let tleft = args[0];
            args.slice(1).forEach(tright=>{
                tleft = intersectRefTypesTypes2(tleft,tright);
            });
            return tleft;
        }

        // TODO: add for cases with logical object - don't actually have to compare them, just add them to the cross product result
        function partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[] {
            if (isNeverType(a)||isNeverType(b)) return [];
            if (isAnyType(a) || isUnknownType(a) || isAnyType(b) || isUnknownType(b)) return [{ left:a,right:b, true:true,false:true }];
            assertCastType<RefTypesTypeNormal>(a);
            assertCastType<RefTypesTypeNormal>(b);
            // let intersectionOfLogicalObjects: FloughLogicalObjectIF | undefined;
            // if (a._logicalObject && b._logicalObject) {
            //     intersectionOfLogicalObjects = intersectionOfFloughLogicalObject(a._logicalObject, b._logicalObject);
            // }

            const symmSet = new Set<Type>();
            const doOneSide = (x: Readonly<RefTypesTypeNormal>, y: Readonly<RefTypesTypeNormal>, pass: 0 | 1): PartitionForEqualityCompareItem[] => {
                const arrYTsTypes: (Type | FloughLogicalObjectIF)[] = getTsTypesExcludingLogicalObject(y);
                if (y._logicalObject) arrYTsTypes.push(y._logicalObject);
                const setYTsTypes = new Set<Type | FloughLogicalObjectIF>(arrYTsTypes);
                const copySetYDelete=(d: Type | FloughLogicalObjectIF) => {
                    const r = new Set(setYTsTypes);
                    r.delete(d);
                    const a: (Type | FloughLogicalObjectIF)[] = [];
                    r.forEach(t=>a.push(t));
                    return a;
                };
                const arr1: PartitionForEqualityCompareItem[] = [];
                // @ts-expect-error mask
                const a = undefined;
                // @ts-expect-error mask
                const b = undefined;
                x._mapLiteral?.forEach((setltx,tx)=>{
                    const setlty = y._mapLiteral?.get(tx);
                    if (setlty){
                        setltx.forEach(ltx=>{
                            if (setlty.has(ltx)){
                                if (pass===0){
                                    arr1.push({ bothts:ltx, true:true });
                                    symmSet.add(ltx);
                                }
                                else if (!symmSet.has(ltx)){
                                    arr1.push({ bothts:ltx, true:true });
                                }
                                const rightts = copySetYDelete(ltx);
                                if (rightts.length!==0) {
                                    arr1.push({ leftts:[ltx], rightts, false:true });
                                }
                            }
                            else {
                                // both x and y have literals under ta, but only x has lta under ta
                                arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                            }
                        });
                    }
                    else if (y._set?.has(tx)){
                        // e.g. ltx is 1, and y is number
                        setltx.forEach(ltx=>{
                            if (pass===0){
                                arr1.push({ bothts:ltx, true:true });
                                symmSet.add(ltx);
                            }
                            else if (!symmSet.has(ltx)){
                                arr1.push({ bothts:ltx, true:true });
                            }
                            // // cannot subtract singular from nonsingular so the inverse of right is just right, and although it matches just label as false only.
                            arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                        });
                    }
                    else {
                        setltx.forEach(ltx=>{
                            arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                        });
                    }
                });
                // TODO: might there be some cases among these types where equality is not identity (e.g., void and undefined)?
                x._set.forEach(tx=>{
                    if (y._set.has(tx)){
                        if (pass===0){
                            arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
                            symmSet.add(tx);
                        }
                        else if (!symmSet.has(tx)){
                            arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
                        }
                        const rightts = copySetYDelete(tx);
                        if (rightts.length!==0){
                            arr1.push({ leftts:[tx], rightts });
                        }
                    }
                    else {
                        arr1.push({ leftts:[tx], rightts:arrYTsTypes, false:true });
                    }
                });
                // Do the logcal object(s)
                // if (intersectionOfLogicalObjects) {
                //     /**
                //      * Ideally we would do this:
                //      * Partition x._logicalObject into intersectionOfLogicalObjects + (x._logicalObject - intersectionOfLogicalObjects)
                //      * arr1.push({ bothts: intersectionOfLogicalObjects, true:true, false: true });
                //      * arr1.push({ leftts: (x._logicalObject - intersectionOfLogicalObjects),
                //      *     rightts: [(y._logicalObject - intersectionOfLogicalObjects), ...copySetYDelete(y._logicalObject!)], true:false, false:true }, );
                //      *
                //      * However, we don't have a way to do the subtraction, so we just do this:
                //      * arr1.push({ bothts: intersectionOfLogicalObjects, true:true, false: true });
                //      * arr1.push({ leftts: intersectionOfLogicalObjects, rightts: [...copySetYDelete(y._logicalObject!)], true:false, false:true }, );
                //      * Could this be better for second one?:
                //      * - arr1.push({ leftts: intersectionOfLogicalObjects, rightts: arrYTsTypes, true:false, false:true }, );
                //      */
                //     if (pass===0) arr1.push({ bothts: intersectionOfLogicalObjects, true:true, false: true });
                //     arr1.push({ leftts: [intersectionOfLogicalObjects],
                //         rightts: [differenceOfFloughLogicalObject(y._logicalObject!,intersectionOfLogicalObjects),...copySetYDelete(y._logicalObject!)], true:false, false:true });
                // }
                // else if (x._logicalObject) {
                //     arr1.push({ leftts: [x._logicalObject], rightts: arrYTsTypes, true:false, false:true });
                // }
                if (pass===1) {
                    arr1.forEach(x=>{
                        if (x.leftts){
                            const tmp = x.leftts;
                            x.leftts = x.rightts;
                            x.rightts = tmp;
                        }
                    });
                }
                return arr1;
            };
            const ret = [ ...doOneSide(a,b,0), ...doOneSide(b,a,1) ];
            return ret;
        }

        // TODO: add for cases with logical object - don't actually have to compare them, just add them to the cross product result
        // @ts-ignore
        function partitionForEqualityCompareDEPRECATED(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[] {
            if (isNeverType(a)||isNeverType(b)) return [];
            if (isAnyType(a) || isUnknownType(a) || isAnyType(b) || isUnknownType(b)) return [{ left:a,right:b, true:true,false:true }];
            const symmSet = new Set<Type>();
            const doOneSide = (x: Readonly<RefTypesType>, y: Readonly<RefTypesType>, pass: 0 | 1): PartitionForEqualityCompareItem[] => {
                const arrYTsTypes: Type[] = getTsTypesExcludingLogicalObject(y);
                const setYTsTypes = new Set<Type>(arrYTsTypes);
                const copySetYDelete=(d: Type) => {
                    const r = new Set(setYTsTypes);
                    r.delete(d);
                    const a: Type[] = [];
                    r.forEach(t=>a.push(t));
                    return a;
                };
                const arr1: PartitionForEqualityCompareItem[] = [];
                // @ts-expect-error mask
                const a = undefined;
                // @ts-expect-error mask
                const b = undefined;
                x._mapLiteral?.forEach((setltx,tx)=>{
                    const setlty = y._mapLiteral?.get(tx);
                    if (setlty){
                        setltx.forEach(ltx=>{
                            if (setlty.has(ltx)){
                                if (pass===0){
                                    arr1.push({ bothts:ltx, true:true });
                                    symmSet.add(ltx);
                                }
                                else if (!symmSet.has(ltx)){
                                    arr1.push({ bothts:ltx, true:true });
                                }
                                const rightts = copySetYDelete(ltx);
                                if (rightts.length!==0) {
                                    arr1.push({ leftts:[ltx], rightts, false:true });
                                }
                            }
                            else {
                                // both x and y have literals under ta, but only x has lta under ta
                                arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                            }
                        });
                    }
                    else if (y._set?.has(tx)){
                        // e.g. ltx is 1, and y is number
                        setltx.forEach(ltx=>{
                            if (pass===0){
                                arr1.push({ bothts:ltx, true:true });
                                symmSet.add(ltx);
                            }
                            else if (!symmSet.has(ltx)){
                                arr1.push({ bothts:ltx, true:true });
                            }
                            // // cannot subtract singular from nonsingular so the inverse of right is just right, and although it matches just label as false only.
                            arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                        });
                    }
                    else {
                        setltx.forEach(ltx=>{
                            arr1.push({ leftts:[ltx], rightts:arrYTsTypes, false:true });
                        });
                    }
                });
                // To do: might there be some cases among these types where equality is not identity (e.g., void and undefined)?
                x._set!.forEach(tx=>{
                    if (y._set!.has(tx)){
                        if (pass===0){
                            arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
                            symmSet.add(tx);
                        }
                        else if (!symmSet.has(tx)){
                            arr1.push({ bothts: tx, true:true, false: (tx.flags & (TypeFlags.BooleanLiteral|TypeFlags.Undefined|TypeFlags.Null)) ? false : true });
                        }
                        const rightts = copySetYDelete(tx);
                        if (rightts.length!==0){
                            arr1.push({ leftts:[tx], rightts });
                        }
                    }
                    else {
                        arr1.push({ leftts:[tx], rightts:arrYTsTypes, false:true });
                    }
                });
                if (pass===1) {
                    arr1.forEach(x=>{
                        if (x.leftts){
                            const tmp = x.leftts;
                            x.leftts = x.rightts;
                            x.rightts = tmp;
                        }
                    });
                }
                return arr1;
            };
            const ret = [ ...doOneSide(a,b,0), ...doOneSide(b,a,1) ];
            return ret;
        }

        /**
         * For non-object this is easy.
         * For objects, we need to compare the types of the properties recursively.  If the compuation is going to be long, abort and return false.
         * During development we can test the abort case by forcing abort even for simple computations.
         * This is called from:
         * - // floughIdentifier - not any more
         * - modifiedInnerSymtabUsingOuterForFinalCondition when updating the symtab.
         * - floughByCallExpression when matching call arguments
         * @param b
         * @returns
         */
        function isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean{
            if (isAnyType(a)) return isAnyType(b) ? true : false;
            if (isUnknownType(a)) return false;
            // eslint-disable-next-line no-null/no-null
            if (isAnyType(b)||isUnknownType(b)) return false;
            Debug.assert(!a._flags && !b._flags);
            let isSubset = true;
            for (let mapiter = a._mapLiteral.entries(), mi = mapiter.next(); !mi.done && isSubset; mi=mapiter.next()){
                const [tstype, litset] = mi.value;
                const bmapset = b._mapLiteral.get(tstype);
                if (!bmapset) {
                    if (!b._set.has(tstype)) isSubset = false;
                    continue;
                }
                for (let litsetiter = litset.values(), litsi = litsetiter.next(); !litsi.done && isSubset; litsi=litsetiter.next()){
                    const ltype = litsi.value;
                    if (bmapset.has(ltype)) continue; // success
                    isSubset = false;
                }
            }
            if (isSubset){
                for (let setiter = a._set.values(), si=setiter.next(); !si.done && isSubset; si=setiter.next()){
                    if (b._set.has(si.value)) continue;
                    isSubset = false;
                }
            }
            return isSubset;
        }

        /**
         * If part of subtrahend set does not exist in minuend it will be ignored.
         * @param subtrahend: the set subtracted from the minuend
         * @param minuend: the set from which the subtrahend set will be removed
         * @returns
         *
         * remark: currently subtractFromType is actively called only from two places:
         * 1. inferRefTypesPreAccess, where it only subtracts [null,undefined].
         * 2. floughByCallExpression, to calc `const notAssignableType = subtractFromType(assignableType, carg.type);`
         * The notAssignableType is a remainder using the calculation of further possible matches when there are multiple overloads.
         * So either add a subtraction operand (it can be used in === comparison also), chage the floughByCallExpression algo, or make a special algo for logicalObjject.
         * For the moment just assert that the subtrahend and minuend do not both contain logical objects (one side only fine).
         */
        function subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>, /* errorOnMissing = false */): RefTypesType {
            if (isNeverType(subtrahend)) return minuend;
            if (isAnyType(subtrahend)) return createRefTypesType(neverTsType);
            if (isUnknownType(subtrahend)||isUnknownType(minuend)) Debug.fail("not yet implemented");
            Debug.assert(!subtrahend._flags && !minuend._flags);
            assertCastType<RefTypesTypeNormal>(subtrahend);
            assertCastType<RefTypesTypeNormal>(minuend);
            Debug.assert(!(subtrahend._logicalObject && minuend._logicalObject));
            const c = createRefTypesTypeNever();
            minuend._mapLiteral.forEach((ltset,tstype)=>{
                const subltset = subtrahend._mapLiteral.get(tstype);
                ltset.forEach(ltype=>{
                    if ((subltset && subltset.has(ltype))||subtrahend._set.has(tstype)) return; // subtract ltype
                    let cltset = c._mapLiteral.get(tstype);
                    if (!cltset) {
                        cltset = new Set<LiteralType>([ltype]);
                        c._mapLiteral.set(tstype,cltset);
                    }
                    else cltset.add(ltype);
                });
            });
            minuend._set.forEach(t=>{
                if (!subtrahend._set.has(t)) c._set.add(t);
            });
            return c;
        }
        function getTypeFromRefTypesType(type: Readonly<RefTypesType>): Type {
            if (type._flags===RefTypesTypeFlags.any) return anyTsType;
            if (type._flags===RefTypesTypeFlags.unknown) return unknownTsType;
            if (isNeverType(type)) return neverTsType;
            const tstypes: Type[] = [];
            const tslittypes: LiteralType[] = [];
            type._set.forEach(t=>tstypes.push(t));
            type._mapLiteral.forEach((litset,_tstype)=>{
                litset.forEach(lt=>{
                    tslittypes.push(lt);
                });
            });
            return checker.getUnionType([...tstypes,...tslittypes],UnionReduction.Literal);
        }
        function isNeverType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.none && type._set.size===0 && type._mapLiteral.size===0 && !type._logicalObject;
        }
        function isAnyType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.any;
        }
        function isUnknownType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.unknown;
        }
        function forEachRefTypesTypeTsTypeExcludingLogicalObject<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void {
            if (type._flags){
                if (type._flags===RefTypesTypeFlags.any) f(anyTsType);
                else f(unknownTsType);
            }
            else if (isNeverType(type)) f(neverTsType);
            else {
                type._set.forEach(t=>f(t));
                type._mapLiteral.forEach((litset,_tstype)=>{
                    litset.forEach(lt=>{
                        f(lt);
                    });
                });
            }
        }
        function forEachRefTypesTypeTsTypeIncludingLogicalObject<F extends (t: Type | FloughLogicalObjectIF) => any>(type: Readonly<RefTypesType>, f: F): void {
            if (type._flags){
                if (type._flags===RefTypesTypeFlags.any) f(anyTsType);
                else f(unknownTsType);
            }
            else if (isNeverType(type)) f(neverTsType);
            else {
                type._set.forEach(t=>f(t));
                type._mapLiteral.forEach((litset,_tstype)=>{
                    litset.forEach(lt=>{
                        f(lt);
                    });
                });
                if (type._logicalObject) f(type._logicalObject);
            }
        }

        function getTsTypesExcludingLogicalObject(type: Readonly<RefTypesType>): Type[] {
            if (type._flags){
                if (type._flags===RefTypesTypeFlags.any) return [anyTsType];
                else return [unknownTsType];
            }
            else if (isNeverType(type)) return [];
            else {
                const at: Type[] = [];
                type._set.forEach(t=>at.push(t));
                type._mapLiteral.forEach((litset,_tstype)=>{
                    litset.forEach(lt=>{
                        at.push(lt);
                    });
                });
                return at;
            }
        }

        function getMapLiteralOfRefTypesType(t: Readonly<RefTypesType>): Readonly<ESMap<Type,Readonly<Set<LiteralType>>>> | undefined {
            return t._mapLiteral;
        }
        // This is used as an optimization to less number of times a type is created, but it is not necessary
        function equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean{
            if (a===b) return true;
            if (a._flags || b._flags) return a._flags===b._flags;
            if (a._set.size !== b._set.size) return false;
            if (a._mapLiteral.size !== b._mapLiteral.size) return false;
            if (a._set.size){
                for (let iter=a._set.values(), it=iter.next(); !it.done; it=iter.next()){
                    if (!b._set.has(it.value)) return false;
                }
            }
            if (a._mapLiteral.size){
                for (let iter=a._mapLiteral.entries(), it=iter.next(); !it.done; it=iter.next()){
                    const [tstype, altset] = it.value;
                    const bltset = b._mapLiteral.get(tstype);
                    if (!bltset || bltset.size!==altset.size) return false;
                    for (let iter2=altset.values(),it2=iter2.next(); !it2.done; it2=iter2.next()){
                        if (!bltset.has(it2.value)) return false;
                    }
                }
            }
            if (!a._logicalObject) {
                if (b._logicalObject) return false;
                else return true;
            }
            else {
                if (!b._logicalObject) return false;
                else return a._logicalObject===b._logicalObject; // sufficient but not necessary condition for actual equality
            }
        }

        // function getUnionOrWidenedType(told: Readonly<RefTypesType>, tnew: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType {
        //     const mnew = getMapLiteralOfRefTypesType(tnew);
        //     if (!mnew) return unionOfRefTypesType([tnew,told]);
        //     const msif = getMapLiteralOfRefTypesType(effectiveDeclaredType);
        //     if (!msif) return unionOfRefTypesType([tnew,told]);
        //     const mold = getMapLiteralOfRefTypesType(told);
        //     let ltcount = 0;
        //     const aktype: Type[] = [];
        //     mnew.forEach((set,ktype)=>{
        //         const msifset = msif?.get(ktype);
        //         if (!msifset) {
        //             aktype.push(ktype);
        //             ltcount += set.size;
        //             return;
        //         }
        //         // otherwise msifset.get(ktype) must containt every member of set because it is a superset - we may assert it
        //         if (extraAsserts){
        //             set.forEach(lt=>Debug.assert(msifset.has(lt)));
        //         }
        //     });
        //     mold?.forEach((set,ktype)=>{
        //         const msifset = msif?.get(ktype);
        //         if (!msifset) {
        //             aktype.push(ktype);
        //             ltcount += set.size;
        //             return;
        //         }
        //         // otherwise msifset.get(ktype) must containt every member of set because it is a superset - we may assert it
        //         if (extraAsserts){
        //             set.forEach(lt=>Debug.assert(msifset.has(lt)));
        //         }
        //     });
        //     if (ltcount>=2){
        //         return addTypesToRefTypesType({ source:aktype, target:unionOfRefTypesType([tnew,told]) });
        //     }
        //     return unionOfRefTypesType([tnew,told]);
        // }
    }

}
