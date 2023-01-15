namespace ts {
    //function assertType<X>(x: any): asserts x is X {};
    export function debugAssert(
        _expression: unknown, _message?: string /*, _verboseDebugInfo?: string | (() => string), _stackCrawlMark?: AnyFunction*/
    ): asserts _expression {
        return Debug.assert(arguments);
    }
    export type RefTypesTypeModule = & {
        isBooleanTrueType(type: Readonly<RefTypesType>): boolean;
        isBooleanFalseType(type: Readonly<RefTypesType>): boolean;
        forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void ;
        // createRefTypesTypeAny(): RefTypesTypeAny ;
        // createRefTypesTypeUnknown(): RefTypesTypeUnknown ;
        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): RefTypesType ;
        cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType;
        // addTypesToRefTypesType({source,target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType ;
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
        forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void ;
        partitionIntoSingularAndNonSingularTypes(type: Readonly<RefTypesType>): {singular: RefTypesType, singularCount: number, nonSingular: RefTypesType, nonSingularCount: number};
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
    };

    export function createRefTypesTypeModule(checker: TypeChecker): RefTypesTypeModule {

        const neverType = checker.getNeverType();
        const unknownType = checker.getUnknownType();
        const stringType = checker.getStringType();
        const numberType = checker.getNumberType();
        const bigintType = checker.getBigIntType();
        const anyType = checker.getAnyType();
        // const undefinedType = checker.getUndefinedType();
        // const errorType = checker.getErrorType();
        // const nullType = checker.getNullType();

        const {
            // dbgNodeToString,
            // dbgSignatureToString,
            // dbgSymbolToStringSimple,
            // dbgTypeToString,
            dbgTypeToStringDetail,
        } = createDbgs(checker);

        return {
            isBooleanFalseType,
            isBooleanTrueType,
            forEachTypeIfUnion, //<F extends ((t: Type) => any)>(type: Type, f: F): void ;
            // createRefTypesTypeAny,
            // createRefTypesTypeUnknown,
            createRefTypesType,
            cloneRefTypesType,
            // addTypesToRefTypesType,
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
            forEachRefTypesTypeType,
            partitionIntoSingularAndNonSingularTypes,
            equalRefTypesTypes,
        };

        function isBooleanTrueType(type: Readonly<RefTypesType>): boolean {
            if (type._flags===RefTypesTypeFlags.none && type._set.size===1){
                if (type._set.values().next().value===checker.getTrueType()){
                    return true;
                }
            }
            return false;
        }
        function isBooleanFalseType(type: Readonly<RefTypesType>): boolean {
            if (type._flags===RefTypesTypeFlags.none && type._set.size===1){
                if (type._set.values().next().value===checker.getFalseType()){
                    return true;
                }
            }
            return false;
        }

        function forEachTypeIfUnion<F extends ((t: Type) => any)>(type: Type, f: F): void {
            (type.flags & TypeFlags.Union) ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        };
        function createRefTypesTypeAny(): RefTypesTypeAny {
            return { _flags: RefTypesTypeFlags.any, _set: undefined, _mapLiteral: undefined };
        }
        function createRefTypesTypeUnknown(): RefTypesTypeUnknown {
            return { _flags: RefTypesTypeFlags.unknown, _set: undefined, _mapLiteral: undefined };
        }
        function _privateAddTsTypeNonUnionToRefTypesType(tstype: Type, type: RefTypesType): RefTypesType {
            Debug.assert(!(tstype.flags & TypeFlags.Union),"unexpected");
            Debug.assert(!(tstype.flags & TypeFlags.Intersection),"not yet implemented");
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

        function createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): RefTypesType {
            if (Array.isArray(tstype)){
                return addTypesToRefTypesType({ source:tstype.slice(1), target:createRefTypesType(tstype[0]) });
            }
            const typeOut: RefTypesType = {
                _flags: RefTypesTypeFlags.none,
                _set: new Set<Type>(),
                _mapLiteral: new Map<Type, Set<LiteralType>>()
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
            return {
                _flags: RefTypesTypeFlags.none,
                _set: new Set(t._set),
                _mapLiteral: _mapLiterals
            };
        }

        function addTypesToRefTypesType({source:at,target:target}: { source: Readonly<Type>[], target: RefTypesType}): RefTypesType {
            at.forEach(t=>{
                target = addTypeToRefTypesType({ source:t,target });
            });
            return target;
        }
        function addTypeToRefTypesType({source:tstype,target:target}: { source: Readonly<Type>, target: RefTypesType}): RefTypesType {
            forEachTypeIfUnion(tstype, t=>{
                target = _privateAddTsTypeNonUnionToRefTypesType(t, target);
            });
            return target;
        }

        /**
         * @param param0 In place modification of target. (Probably would have been better to return new type)
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
            let tmpTarget = target;
            source._set.forEach(tstype=>{
                tmpTarget = addTypeToRefTypesType({ source:tstype, target:tmpTarget });
            });
            source._mapLiteral.forEach((set,_key)=>{
                //tmpTarget = addTypeToRefTypesType({ source:tstype, target:tmpTarget });
                set.forEach(tsLiteralType=>{
                    tmpTarget = addTypeToRefTypesType({ source:tsLiteralType, target:tmpTarget });
                });
            });
            target._flags = tmpTarget._flags;
            target._set = tmpTarget._set;
            target._mapLiteral = tmpTarget._mapLiteral;
        }

        function unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType {
            let hasUnknown = false;
            const target = createRefTypesType();//never
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

        function isectSet<T>(x: Readonly<Set<T>>,y: Readonly<Set<T>>): Set<T> {
            const z = new Set<T>();
            if (y.size<x.size) [x,y]=[y,x];
            x.forEach(t=>{
                if (y.has(t)) z.add(t);
            });
            return z;
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
                        iset.delete(tstype); // TODO: kill
                    }
                });
            });
        }
        function intersectRefTypesTypes2(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            if (isAnyType(a)) return cloneRefTypesType(b);
            if (isAnyType(b)) return cloneRefTypesType(a);
            Debug.assert(!a._flags && !b._flags);
            if (isUnknownType(a)||isUnknownType(b)) return createRefTypesTypeUnknown();
            const iset = isectSet(a._set, b._set);
            const _mapLiteral = new Map<Type, Set<LiteralType>>();
            intersectRefTypesTypesAux(a,b,iset,_mapLiteral);
            intersectRefTypesTypesAux(b,a,iset,_mapLiteral);
            return {
                _flags: RefTypesTypeFlags.none,
                _set: iset,
                _mapLiteral
            };
        }
        function intersectionOfRefTypesType(...args: Readonly<RefTypesType>[]): RefTypesType {
            if (args.length===0) return createRefTypesType(); // never
            if (args.length===1) return args[0];
            let tleft = args[0];
            args.slice(1).forEach(tright=>{
                tleft = intersectRefTypesTypes2(tleft,tright);
            });
            return tleft;
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
         */
        function subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>, /* errorOnMissing = false */): RefTypesType {
            if (isNeverType(subtrahend)) return minuend;
            if (isAnyType(subtrahend)) return createRefTypesType(neverType);
            if (isUnknownType(subtrahend)||isUnknownType(minuend)) Debug.fail("not yet implemented");
            Debug.assert(!subtrahend._flags && !minuend._flags);
            const c = createRefTypesType() as RefTypesTypeNormal;
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
            return checker.getUnionType([...tstypes,...tslittypes],UnionReduction.Literal);
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
        function forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<RefTypesType>, f: F): void {
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
        function partitionIntoSingularAndNonSingularTypes(type: Readonly<RefTypesType>): {
            singular: RefTypesType, singularCount: number, nonSingular: RefTypesType, nonSingularCount: number
        } {
            let singularCount = 0;
            let nonSingularCount = 0;
            if (isAnyType(type)) return { singular: createRefTypesType(), singularCount, nonSingular: createRefTypesTypeAny(), nonSingularCount:1 };
            if (isUnknownType(type)) return { singular: createRefTypesType(), singularCount, nonSingular: createRefTypesTypeUnknown(), nonSingularCount:1 };
            if (!type._flags){
                const singular = createRefTypesType() as RefTypesTypeNormal;
                const nonSingular = createRefTypesType() as RefTypesTypeNormal;
                type._set.forEach(t=>{
                    if (t.flags & TypeFlags.BooleanLiteral) {
                        singular._set.add(t);
                        singularCount++;
                    }
                    else {
                        nonSingular._set.add(t);
                        nonSingularCount++;
                    }
                });
                type._mapLiteral.forEach((set,tstype)=>{
                    set.forEach(t=>{
                        const got = singular._mapLiteral.get(tstype);
                        if (!got) singular._mapLiteral.set(tstype, new Set<LiteralType>([t]));
                        else got.add(t);
                        singularCount++;
                    });
                });
                return { singular,singularCount,nonSingular,nonSingularCount };
            }
            Debug.fail("unexpected");
        }
        /**
         * Used for testing purposes
         * @param a
         * @param b
         * @returns
         */
        function equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean{
            if (a._flags===RefTypesTypeFlags.any && b._flags===RefTypesTypeFlags.any) return true;
            if (a._flags===RefTypesTypeFlags.unknown && b._flags===RefTypesTypeFlags.unknown) return false;
            if (a._flags !== b._flags) return false;
            Debug.assert(!a._flags && !b._flags);
            if (a._set.size !== b._set.size) return false;
            if (a._mapLiteral.size !== b._mapLiteral.size) return false;
            for (let iter=a._mapLiteral.entries(), it=iter.next(); !it.done; it=iter.next()){
                const [tstype, altset] = it.value;
                const bltset = b._mapLiteral.get(tstype);
                if (!bltset || bltset.size!==altset.size) return false;
                for (let iter2=altset.values(),it2=iter2.next(); !it2.done; it2=iter2.next()){
                    if (!bltset.has(it2.value)) return false;
                }
            }
            for (let iter=a._set.values(), it=iter.next(); !it.done; it=iter.next()){
                if (!b._set.has(it.value)) return false;
            }
            return true;
        }

    }

}
