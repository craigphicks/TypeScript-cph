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
        _set: Set<Type>;
        _mapLiteral: ESMap<Type, Set<LiteralType>>;
        //_intersectionOfObjects?: RefTypesTypeNormal[];
        _objects?: FloughObjectTypeInstance[];
        _intersection?: RefTypesTypeNormal[];
        _union?: RefTypesTypeNormal[];
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

    function hasNonObjectTypes(type: Readonly<RefTypesTypeNormal>): boolean {
        return !!(type._set?.size || type._mapLiteral?.size);
    }
    function hasObjectTypes(type: Readonly<RefTypesTypeNormal>): boolean {
        return !!(type._objects?.length || type._intersection?.length || type._union?.length);
    }

    // export type RefTypesObjectIntersection = & {
    //     objects: Readonly<FloughObjectTypeInstance>[];
    // };

    type PartitionForEqualityCompareItem = & {
        left?: Readonly<RefTypesType>;
        right?: Readonly<RefTypesType>;
        both?: Readonly<RefTypesType>;
        leftts?: Type[];
        rightts?: Type[];
        bothts?: Type;
        true?: boolean;
        false?: boolean;
    };
    //export declare function partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[];


    export type RefTypesTypeModule = & {
        //getTypeMemberCount(type: Readonly<RefTypesType>): number;
        forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void ;
        // createRefTypesTypeAny(): RefTypesTypeAny ;
        // createRefTypesTypeUnknown(): RefTypesTypeUnknown ;
        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): RefTypesType ;
        createRefTypesTypeNever(): RefTypesTypeNormal;
        cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType;
        addTypesToRefTypesType({source,target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType ;
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: RefTypesType}): RefTypesType ;
        mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void ;
        unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType ;
        intersectionOfRefTypesType(...args: Readonly<RefTypesType>[]): RefTypesType ;
        isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>, /* errorOnMissing = false */): RefTypesType ;
        getTypeFromRefTypesType(type: Readonly<RefTypesType>): Type ;
        isNeverType(type: Readonly<RefTypesType>): boolean ;
        isAnyType(type: Readonly<RefTypesType>): boolean ;
        isUnknownType(type: Readonly<RefTypesType>): boolean ;
        forEachNonObjectRefTypesTypeTsType<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void ;
        //partitionIntoSingularAndNonSingularTypes(type: Readonly<RefTypesType>): {singular: RefTypesType, singularCount: number, nonSingular: RefTypesType, nonSingularCount: number};
        getMapLiteralOfRefTypesType(t: RefTypesType): Readonly<ESMap<Type,Readonly<Set<LiteralType>>>> | undefined;
        //getLiteralsOfANotInB(ta: Readonly<RefTypesType>, tb: Readonly<RefTypesType>): Readonly<ESMap<Type,Readonly<Set<LiteralType>>>> | undefined;
        //refTypesTypeNormalHasType(type: Readonly<RefTypesTypeNormal>, tstype: Readonly<Type>): boolean;
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        //literalWideningUnion(tunion: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        getUnionOrWidenedType(told: Readonly<RefTypesType>, tnew: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        // widenLiteralsAccordingToEffectiveDeclaredType(type: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType;
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: RefTypesType): RefTypesType;
        partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[];
        addFloughObjectTypeInstanceToRefTypesTypeMutate(fobj: FloughObjectTypeInstance, target: RefTypesType): RefTypesType;
        };

    export function createRefTypesTypeModule(checker: TypeChecker): RefTypesTypeModule {

        const neverType = checker.getNeverType();
        const unknownType = checker.getUnknownType();
        const stringType = checker.getStringType();
        const numberType = checker.getNumberType();
        const bigintType = checker.getBigIntType();
        const anyType = checker.getAnyType();
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
            //getTypeMemberCount,
            forEachTypeIfUnion, //<F extends ((t: Type) => any)>(type: Type, f: F): void ;
            createRefTypesType,
            createRefTypesTypeNever,
            cloneRefTypesType,
            addTypesToRefTypesType,
            addTypeToRefTypesType,
            mergeToRefTypesType,
            unionOfRefTypesType,
            intersectionOfRefTypesType,
            isASubsetOfB,
            subtractFromType,
            getTypeFromRefTypesType,
            isNeverType,
            isAnyType,
            isUnknownType,
            forEachNonObjectRefTypesTypeTsType,
            //partitionIntoSingularAndNonSingularTypes,
            getMapLiteralOfRefTypesType,
            equalRefTypesTypes,
            //literalWideningUnion,
            getUnionOrWidenedType,
            //widenLiteralsAccordingToEffectiveDeclaredType,
            addTsTypeNonUnionToRefTypesTypeMutate,
            partitionForEqualityCompare,
            addFloughObjectTypeInstanceToRefTypesTypeMutate,
        };

        function forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void {
            (type.flags & TypeFlags.Union) ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        };
        function createRefTypesTypeAny(): RefTypesTypeAny {
            return { _flags: RefTypesTypeFlags.any, _set: undefined, _mapLiteral: undefined };
        }
        function createRefTypesTypeUnknown(): RefTypesTypeUnknown {
            return { _flags: RefTypesTypeFlags.unknown, _set: undefined, _mapLiteral: undefined };
        }

        function addFloughObjectTypeInstanceToRefTypesTypeMutate(fobj: FloughObjectTypeInstance, target: RefTypesType): RefTypesType {
            if (target._flags & RefTypesTypeFlags.any) return target;
            if (target._flags & RefTypesTypeFlags.unknown) return target;
            assertCastType<RefTypesTypeNormal>(target);
            if (!target._objects) target._objects = [];
            target._objects.push(fobj);
            return target;
        }
        // This mutates type even though it say it does not (Readonly). Why is that not caught? Because Sets do not count.
        function addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: RefTypesType): RefTypesType {
            Debug.assert(!(tstype.flags & TypeFlags.Union),"unexpected");
            if (tstype.flags & TypeFlags.Intersection){
                Debug.assert(!(tstype.flags & TypeFlags.Intersection),"not yet implemented");
            }
            if (tstype===neverType) return type;
            if (tstype===anyType || type._flags===RefTypesTypeFlags.any) {
                return createRefTypesTypeAny();
            }
            if (tstype===unknownType || type._flags===RefTypesTypeFlags.unknown) {
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
                    if (!type._set.has(numberType)){
                        keyType = numberType;
                        // TODO: could we just do tstype.regularType? Maybe not if it is an Enum.
                        regularTsType = checker.getNumberLiteralType((tstype as NumberLiteralType).value);
                    }
                }
                else if (tstype.flags & TypeFlags.StringLiteral){
                    if (!type._set.has(stringType)) {
                        keyType = stringType;
                        regularTsType = checker.getStringLiteralType((tstype as StringLiteralType).value);
                    }
                }
                else if (tstype.flags & TypeFlags.BigIntLiteral) {
                    if (!type._set.has(bigintType)) {
                        keyType = bigintType;
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
            else {
                const regularTsType = (tstype as any).regularType ? (tstype as any).regularType : tstype;
                // may have to erase literals
                if (regularTsType.flags & (TypeFlags.Number|TypeFlags.String|TypeFlags.BigInt)){
                    Debug.assert(regularTsType===numberType||regularTsType===stringType||regularTsType===bigintType, "unexpected");
                    /* if (type._setLiteral.has(regularTsType)) */ type._mapLiteral.delete(regularTsType);
                }
                type._set.add(regularTsType);
            }
            return type;
        }

        function createRefTypesTypeNever(): RefTypesTypeNormal {
            return createRefTypesTypeNever();
        }


        function createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): RefTypesType {
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
            return addTypeToRefTypesType({ source:tstype as Readonly<Type>,target:typeOut });
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
            if (t._objects) r._objects = t._objects.slice(0);
            return r;
        }

        function addTypesToRefTypesType({source:at,target:target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType {
            at.forEach(t=>{
                target = addTypeToRefTypesType({ source:t,target });
            });
            return target;
        }
        function addTypeToRefTypesType({source:tstype,target:target}: { source: Readonly<Type>, target: Readonly<RefTypesType>}): RefTypesType {
            forEachTypeIfUnion(tstype, t=>{
                target = addTsTypeNonUnionToRefTypesTypeMutate(t, target);
            });
            return target;
        }

        /**
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
                tmpTarget = addTypeToRefTypesType({ source:tstype, target:tmpTarget }) as RefTypesTypeNormal;
            });
            source._mapLiteral.forEach((set,_key)=>{
                //tmpTarget = addTypeToRefTypesType({ source:tstype, target:tmpTarget });
                set.forEach(tsLiteralType=>{
                    tmpTarget = addTypeToRefTypesType({ source:tsLiteralType, target:tmpTarget }) as RefTypesTypeNormal;
                });
            });
            target._flags = tmpTarget._flags;
            target._set = tmpTarget._set;
            target._mapLiteral = tmpTarget._mapLiteral;

            if (source._objects){
                if (!target._objects) target._objects = [];
                target._objects.push(...source._objects);
            }

            if (source._intersection){
                Debug.assert(!source._union);
                if (!target._union) target._union = [];
                target._union.push({ ...createRefTypesTypeNever(), _intersection:source._intersection });
            }
            else if (source._union){
                if (!target._union) target._union = [];
                target._union.push(...source._union);
            }
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

        function isectSet(x: Readonly<Set<Type>>,y: Readonly<Set<Type>>): [nonbj:Set<Type>,obj:Set<Type>] {
            const nonobj = new Set<Type>();
            const ouiobj = new Set<Type>();
            if (y.size<x.size) [x,y]=[y,x];
            x.forEach(xt=>{
                if (xt.flags & TypeFlags.Object){
                    for (let iter = y.values(),y2 = iter.next();!y2.done;y2 = iter.next()){
                        const yt = y2.value;
                        if (checker.isTypeRelatedTo(xt,yt,checker.getRelations().identityRelation)) ouiobj.add(xt);
                    }
                }
                else if (y.has(xt)) nonobj.add(xt);
            });
            return [nonobj,ouiobj];
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
        function intersectRefTypesTypes2(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            if (isAnyType(a)) return cloneRefTypesType(b);
            if (isAnyType(b)) return cloneRefTypesType(a);
            if (isUnknownType(a)||isUnknownType(b)) return createRefTypesTypeUnknown();
            Debug.assert(!a._flags && !b._flags);
            assertCastType<RefTypesTypeNormal>(a);
            assertCastType<RefTypesTypeNormal>(b);
            if (hasNonObjectTypes(a) && hasObjectTypes(b)) return createRefTypesTypeNever();
            if (hasNonObjectTypes(b) && hasObjectTypes(a)) return createRefTypesTypeNever();
            let ret = createRefTypesTypeNever();
            if (a._set.size || a._mapLiteral.size || b._set.size || b._mapLiteral.size){
                if (a._objects?.length || a._intersection?.length || a._union?.length) return createRefTypesTypeNever(); // never
                if (b._objects?.length || b._intersection?.length || b._union?.length) return createRefTypesTypeNever(); // never
                const [isetnonobj,isetobj] = isectSet(a._set, b._set);
                const _mapLiteral = new Map<Type, Set<LiteralType>>();
                intersectRefTypesTypesAux(a,b,isetnonobj,_mapLiteral);
                intersectRefTypesTypesAux(b,a,isetnonobj,_mapLiteral);
                if (isetobj.size) isetobj.forEach(t=>isetnonobj.add(t));
                ret = {
                    _flags: RefTypesTypeFlags.none,
                    _set: isetnonobj,
                    _mapLiteral,
                };
            }
            const _intersection: RefTypesTypeNormal[] = [];
            if (a._intersection?.length){
                _intersection.push(...a._intersection);
            }
            else _intersection.push(a);
            if (b._intersection?.length){
                _intersection.push(...b._intersection);
            }
            else _intersection.push(a);

            return {
                ...ret,
                _intersection
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

        // @ ts-expect-error
        function partitionForEqualityCompare(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): PartitionForEqualityCompareItem[] {
            if (isNeverType(a)||isNeverType(b)) return [];
            if (isAnyType(a) || isUnknownType(a) || isAnyType(b) || isUnknownType(b)) return [{ left:a,right:b, true:true,false:true }];
            if (hasObjectTypes(a as RefTypesTypeNormal)||hasObjectTypes(b as RefTypesTypeNormal)) Debug.fail("not yet implemented");
            const symmSet = new Set<Type>();
            const doOneSide = (x: Readonly<RefTypesType>, y: Readonly<RefTypesType>, pass: 0 | 1): PartitionForEqualityCompareItem[] => {
                const arrYTsTypes: Type[] = getNonObjectTsTypesOfType(y);
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

        // /**
        //  * If a is a subset of b returns true, else false.
        //  * @param a
        //  * @param b
        //  */
        function isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean{
            if (isAnyType(a)) return isAnyType(b) ? true : false;
            if (isUnknownType(a)) return false;
            // eslint-disable-next-line no-null/no-null
            if (isAnyType(b)||isUnknownType(b)) return false;
            Debug.assert(!a._flags && !b._flags);
            if (hasObjectTypes(a) || !hasObjectTypes(b)) return false;
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
            if (hasObjectTypes(a) || hasObjectTypes(b)) Debug.fail("not yet implemented");
            return isSubset;
        }

        /**
         * If part of subtrahend set does not exist in minuend it will be ignored.
         * @param subtrahend: the set subtracted from the minuend
         * @param minuend: the set from which the subtrahend set will be removed
         * @returns
         */
        function subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>, /* errorOnMissing = false */): RefTypesType {
            if (isNeverType(subtrahend)) return minuend;
            if (isAnyType(subtrahend)) return createRefTypesType(neverType);
            if (isUnknownType(subtrahend)||isUnknownType(minuend)) Debug.fail("not yet implemented");
            Debug.assert(!subtrahend._flags && !minuend._flags);
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
            (minuend as RefTypesTypeNormal)._set.forEach(t=>{
                if (!(subtrahend as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
            });
            if (hasObjectTypes(subtrahend) || hasObjectTypes(minuend)) Debug.fail("not yet implemented");
            return c;
        }
        function getTypeFromRefTypesType(type: Readonly<RefTypesType>): Type {
            if (type._flags===RefTypesTypeFlags.any) return anyType;
            if (type._flags===RefTypesTypeFlags.unknown) return unknownType;
            if (isNeverType(type)) return neverType;
            const tstypes: Type[] = [];
            const tslittypes: LiteralType[] = [];
            type._set.forEach(t=>tstypes.push(t));
            type._mapLiteral.forEach((litset,_tstype)=>{
                litset.forEach(lt=>{
                    tslittypes.push(lt);
                });
            });
            const all = [...tstypes,...tslittypes];
            if (type._intersection){
                const isecttstype = checker.getIntersectionType(type._intersection.map(rtt=>getTypeFromRefTypesType(rtt)));
                all.push(isecttstype);
            }
            if (type._union){
                all.push(...type._union.map(rtt=>getTypeFromRefTypesType(rtt)));
            }
            if (type._objects) all.push(...type._objects.map(fti=>fti.tsObjectType));
            return checker.getUnionType(all,UnionReduction.Literal);
        }
        function isNeverType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.none && type._set.size===0 && type._mapLiteral.size===0;
        }
        function isAnyType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.any;
        }
        function isUnknownType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.unknown;
        }
        function forEachNonObjectRefTypesTypeTsType<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void {
            if (type._flags){
                if (type._flags===RefTypesTypeFlags.any) f(anyType);
                else f(unknownType);
            }
            else if (isNeverType(type)) f(neverType);
            else {
                type._set.forEach(t=>f(t));
                type._mapLiteral.forEach((litset,_tstype)=>{
                    litset.forEach(lt=>{
                        f(lt);
                    });
                });
            }
        }

        function getNonObjectTsTypesOfType(type: Readonly<RefTypesType>): Type[] {
            if (type._flags){
                if (type._flags===RefTypesTypeFlags.any) return [anyType];
                else return [unknownType];
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

        function forEachObjectRefTypesTypeLookupProperty<F extends (type: RefTypesType, baseType?: RefTypesType) => any>(type: Readonly<RefTypesType>, key: string, f: F): void {
            if (isAnyType(type)) f(createRefTypesTypeAny());
            if (isUnknownType(type)) f(createRefTypesTypeAny());
            assertCastType<RefTypesTypeNormal>(type);
            if (type._objects){
                type._objects.forEach(fti=>{
                    f(fti.keyToType?.get(key)??createRefTypesTypeNever());
                });
                // TODO: we're going to continue after implementing FloughLogicalObjectTypesInstance
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
            if (hasNonObjectTypes(a) || hasNonObjectTypes(b)) return false; // TODO: do the calclulation
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
            return true;
        }

        function getUnionOrWidenedType(told: Readonly<RefTypesType>, tnew: Readonly<RefTypesType>, effectiveDeclaredType: Readonly<RefTypesType>): RefTypesType {
            const mnew = getMapLiteralOfRefTypesType(tnew);
            if (!mnew) return unionOfRefTypesType([tnew,told]);
            const msif = getMapLiteralOfRefTypesType(effectiveDeclaredType);
            if (!msif) return unionOfRefTypesType([tnew,told]);
            const mold = getMapLiteralOfRefTypesType(told);
            let ltcount = 0;
            const aktype: Type[] = [];
            mnew.forEach((set,ktype)=>{
                const msifset = msif?.get(ktype);
                if (!msifset) {
                    aktype.push(ktype);
                    ltcount += set.size;
                    return;
                }
                // otherwise msifset.get(ktype) must containt every member of set because it is a superset - we may assert it
                if (extraAsserts){
                    set.forEach(lt=>Debug.assert(msifset.has(lt)));
                }
            });
            mold?.forEach((set,ktype)=>{
                const msifset = msif?.get(ktype);
                if (!msifset) {
                    aktype.push(ktype);
                    ltcount += set.size;
                    return;
                }
                // otherwise msifset.get(ktype) must containt every member of set because it is a superset - we may assert it
                if (extraAsserts){
                    set.forEach(lt=>Debug.assert(msifset.has(lt)));
                }
            });
            if (ltcount>=2){
                return addTypesToRefTypesType({ source:aktype, target:unionOfRefTypesType([tnew,told]) });
            }
            return unionOfRefTypesType([tnew,told]);
        }
    }

}
