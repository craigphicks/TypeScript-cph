namespace ts {

    // function castType<X>(x: any): x is X {
    //     return true;
    // };
    // @ts-ignore TS6133: 'x' is declared but its value is never read.
    function assertType<X>(x: any): asserts x is X {};

    export function isRefTypesTableLeaf(x: RefTypesTable): x is RefTypesTableLeaf {
        return x.kind===RefTypesTableKind.leaf;
    }
    export function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn {
        return x.kind===RefTypesTableKind.return;
    }

    export interface MrNarrow {
        mrNarrowTypes({ refTypesSymtab: refTypes, expr: condExpr, crit, qdotfallout, inferStatus }: InferRefArgs): MrNarrowTypesReturn;
        createRefTypesSymtab(): RefTypesSymtab;
        copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab;
        createRefTypesType(type?: Readonly<Type>): RefTypesType;
        createRefTypesTableLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, type?: RefTypesType): RefTypesTableLeaf;
        dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string;
        dbgRefTypesTableToStrings(t: RefTypesTable): string[],
        dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[],
        dbgConstraintItem(ci: ConstraintItem): string[];
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void,
        unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType,
        mergeArrRefTypesTableReturnToRefTypesTableReturn({
            symbol, isconst, type:typeIn, arr, stripSymbols}: {
            symbol?: Symbol | undefined, isconst?: boolean | undefined, type?: RefTypesType, arr: Readonly<RefTypesTableReturn[]>, stripSymbols?: boolean}):
            RefTypesTableReturn;
        createNodeToTypeMap(): NodeToTypeMap,
        mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void,
        mergeArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab,
        intersectRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType,
        intersectRefTypesTypesImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): [RefTypesType, boolean];
        typeImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>): RefTypesType;
        isNeverType(t: Readonly<RefTypesType>): boolean,
        isAnyType(t: Readonly<RefTypesType>): boolean,
        isUnknownType(t: Readonly<RefTypesType>): boolean,
        applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType,crit: InferCrit, func: F): void,
        checker: TypeChecker
    };

    export function createMrNarrow(checker: TypeChecker, _mrState: MrState): MrNarrow {

        const mrNarrow: MrNarrow = {
            mrNarrowTypes,
            createRefTypesSymtab,
            copyRefTypesSymtab,
            createRefTypesType,
            createRefTypesTableLeaf,
            dbgRefTypesTypeToString,
            dbgRefTypesTableToStrings,
            dbgRefTypesSymtabToStrings,
            dbgConstraintItem,
            equalRefTypesTypes,
            mergeToRefTypesType,
            unionOfRefTypesType,
            mergeArrRefTypesTableReturnToRefTypesTableReturn,
            createNodeToTypeMap,
            mergeIntoNodeToTypeMaps,
            mergeArrRefTypesSymtab,
            intersectRefTypesTypes,
            intersectRefTypesTypesImplies,
            typeImplies,
            isASubsetOfB:typeImplies,
            subtractFromType,
            isNeverType,
            isAnyType,
            isUnknownType,
            applyCritToRefTypesType,
            checker,
        };


        let myDebug = getMyDebug();

        const {
            // @ts-ignore-error
            subtypeRelation,
            // @ts-ignore-error
            strictSubtypeRelation,
            assignableRelation,
            // @ts-ignore-error
            comparableRelation,
            // @ts-ignore-error
            identityRelation,
            // @ts-ignore-error
            enumRelation,
        } = checker.getRelations();
        const neverType = checker.getNeverType();
        const undefinedType = checker.getUndefinedType();
        const unknownType = checker.getUnknownType();
        const errorType = checker.getErrorType();
        const nullType = checker.getNullType();
        const stringType = checker.getStringType();
        const numberType = checker.getNumberType();
        const anyType = checker.getAnyType();
        // 'checker' has a function 'forEach(t,f)', but it unexpectedly works like 'some' returning immediately if f(t) return a truthy value.
        // Confusingly, 'checker' also has a function 'some(t,f)', that works as expected.
        // TODO: Internally, just use Set until rendering.
        const forEachTypeIfUnion = <F extends ((t: Type) => any)>(type: Type, f: F)=>{
            type.flags & TypeFlags.Union ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        };
        const typeToString = checker.typeToString;
        const getTypeOfSymbol = checker.getTypeOfSymbol;
        const isArrayType = checker.isArrayType;
        const isArrayOrTupleType = checker.isArrayOrTupleType;
        const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
        const getReturnTypeOfSignature = checker.getReturnTypeOfSignature;
        const isReadonlyProperty = checker.isReadonlyProperty;
        const isConstVariable = checker.isConstVariable;
        // @ts-ignore-error
        const isConstantReference = checker.isConstantReference;
        // @ts-ignore-error
        const getNodeLinks = checker.getNodeLinks;
        const getUnionType = checker.getUnionType;
        const getResolvedSymbol = checker.getResolvedSymbol; // for Identifiers only
        const getSymbolOfNode = checker.getSymbolOfNode;

        const {
            dbgNodeToString,
            dbgSignatureToString,
            dbgSymbolToStringSimple,
        } = createDbgs(checker);

        function arrayFromSet<T>(set: Set<T>): T[] {
            // @ts-expect-error 2769
            return Array.from(set.keys()); //as Readonly<T[]>
        }

        // @ts-expect-error
        function createRefTypesTypeAny(): RefTypesTypeAny {
            return { _flags: RefTypesTypeFlags.any, _set: undefined };
        }
        function createRefTypesTypeUnknown(): RefTypesTypeUnknown {
            return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
        }
        function createRefTypesType(type?: Readonly<Type>): RefTypesType {
            if (type===anyType) return { _flags: RefTypesTypeFlags.any, _set: undefined };
            if (type===unknownType) return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
            const _set = new Set<Type>();
            if (type===neverType || !type) return { _flags: RefTypesTypeFlags.none, _set };
            forEachTypeIfUnion(type, t=>{
                Debug.assert(t!==neverType);
                Debug.assert(t!==anyType);
                Debug.assert(t!==unknownType);
                _set.add(t);
            });
            return {
                _flags: RefTypesTypeFlags.none,
                _set
            };
        }
        function cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType{
            return { _flags: t._flags, _set: t._set? new Set(t._set) : undefined } as any as RefTypesType;
        }

        function addTypeToRefTypesType({source:t,target:target}: { source: Readonly<Type>, target: RefTypesType}): void {
            if (target._flags){
                if (target._flags===RefTypesTypeFlags.any) return;
                else if (t===anyType){
                    (target as any as RefTypesTypeAny)._flags=RefTypesTypeFlags.any;
                    return;
                }
                return; // target._flags=RefTypesTypeFlags.unknown
            }
            if (!(t.flags & TypeFlags.Union)) {
                if (t===anyType) {
                    (target as any as RefTypesTypeAny)._set=undefined;
                    (target as any as RefTypesTypeAny)._flags=RefTypesTypeFlags.any;
                }
                else if (t===unknownType){
                    (target as any as RefTypesTypeUnknown)._set=undefined;
                    (target as any as RefTypesTypeUnknown)._flags=RefTypesTypeFlags.unknown;
                }
                else if (t!==neverType) target._set.add(t);
            }
            else {
                // let hadAny = false;
                // let hadUnknown = false;
                forEachTypeIfUnion(t, tt=> {
                    Debug.assert(t!==anyType);
                    Debug.assert(t!==unknownType);
                    // if (t===anyType) hadAny = true;
                    // if (t===unknownType) hadUnknown = true;
                    if (t!==neverType) target._set.add(tt);
                });
                // if (hadAny) {
                //     rt._set.clear();
                //     rt._flags=RefTypesTypeFlags.any;
                // }
                // else if (hadUnknown){
                //     rt._set.clear();
                //     rt._flags=RefTypesTypeFlags.unknown;
                // }
            }
        }
        function mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void {
            if (isNeverType(source)) return;
            if (isAnyType(source)){
                (target as any as RefTypesTypeAny)._flags = RefTypesTypeFlags.any;
                (target as any as RefTypesTypeAny)._set = undefined;
                return;
            }
            if (isAnyType(target)) return;
            if (isUnknownType(source)){
                (target as any as RefTypesTypeUnknown)._flags = RefTypesTypeFlags.unknown;
                (target as any as RefTypesTypeUnknown)._set = undefined;
                return;
            }
            if (isUnknownType(target)) return;
            (source as RefTypesTypeNormal)._set.forEach(t=>{
               (target as RefTypesTypeNormal)._set.add(t);
            });
        }
        function unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType {
            let hasUnknown = false;
            const target = createRefTypesType();//never
            for (const type of types){
                if (isAnyType(type)) {
                    return { _flags: RefTypesTypeFlags.any, _set: undefined };
                }
                if (isUnknownType(type)){
                    hasUnknown = true;
                    continue;
                }
                if (hasUnknown) continue;
                (type as RefTypesTypeNormal)._set.forEach(t=>{
                    (target as RefTypesTypeNormal)._set.add(t);
                 });
            }
            if (hasUnknown) return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
            return target;
        }

        /**
         * How to deal with unknown type?
         * If either is never then return never.
         * Else if both are unknown return unknown.
         * Else if either is unknown, and the other is not any, then the answer is a specific non-any type that need to be confirmed before use, but such a category doesn't exist in Typescript.
         * - solutions? (1) return unknown, (2) return the type of other, (3) Debug fail. Start with Debug fail and see what happens.
         * @param a
         * @param b
         * @returns
         */
        function intersectRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            if (isAnyType(a)) return cloneRefTypesType(b);
            if (isAnyType(b)) return cloneRefTypesType(a);
            if (isUnknownType(a)||isUnknownType(b)) return createRefTypesTypeUnknown();
            const c = createRefTypesType() as RefTypesTypeNormal;
            (a as RefTypesTypeNormal)._set.forEach(t=>{
                if ((b as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
            });
            return c;
        }
        /**
         * If a is a subset of b returns true, else false.
         * @param a
         * @param b
         */
         function typeImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>) {
            if (isAnyType(a)) return isAnyType(b) ? true : false;
            if (isUnknownType(a)) return false;
            // eslint-disable-next-line no-null/no-null
            if (isAnyType(b)||isUnknownType(b)) return false;
            for (let titer = (a as RefTypesTypeNormal)._set.keys(), ti = titer.next(); !ti.done; ti=titer.next()){
                if (!(b as RefTypesTypeNormal)._set.has(ti.value)) return false;
            }
            return true;
        }
        function intersectRefTypesTypesImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): [RefTypesType, boolean] {
            // TODO: could be optimized because computations in intersectRefTypesTypes and typeImplies overlap
            return [ intersectRefTypesTypes(a,b), typeImplies(a,b)];
        }
        /**
         * If part of subtrahend set does not exist in minuend it will be ignored.
         * @param subtrahend: the set subtracted from the minuend
         * @param minuend: the set from which the subtrahend set will be removed
         * @returns
         */
        function subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>): RefTypesType {
            if (isNeverType(subtrahend)) return minuend;
            if (isAnyType(subtrahend)) return createRefTypesType(neverType);
            if (isUnknownType(subtrahend)||isUnknownType(minuend)) Debug.fail("inverseType: input is unknownType");
            const c = createRefTypesType() as RefTypesTypeNormal;
            (minuend as RefTypesTypeNormal)._set.forEach(t=>{
                if (!(subtrahend as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
            });
            return c;
        }
        // @ts-ignore-error
        function copyRefTypesType(rt: Readonly<RefTypesType>): RefTypesType {
            const _set = rt._set;
            return { _set: _set? new Set(_set) : undefined, _flags: rt._flags } as RefTypesType;
        }
        function getTypeFromRefTypesType(rt: Readonly<RefTypesType>): Type {
            if (rt._flags===RefTypesTypeFlags.any) return anyType;
            if (rt._flags===RefTypesTypeFlags.unknown) return unknownType;
            if (rt._set.size===0) return neverType;
            return getUnionType(arrayFromSet(rt._set),UnionReduction.Literal);
        }
        function isNeverType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.none && type._set.size===0;
        }
        function isAnyType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.any;
        }
        function isUnknownType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.unknown;
        }
        function forEachRefTypesTypeType<F extends (t: Type) => any>(r: Readonly<RefTypesType>, f: F): void {
            if (r._flags){
                if (r._flags===RefTypesTypeFlags.any) f(anyType);
                else f(unknownType);
            }
            else if (r._set.size===0) f(neverType);
            else r._set.forEach(t=>f(t));
        }
        function equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>){
            if (a._flags===RefTypesTypeFlags.any || b._flags===RefTypesTypeFlags.any) return true;
            if (a._flags===RefTypesTypeFlags.unknown || b._flags===RefTypesTypeFlags.unknown) return false;
            if (a._flags !== b._flags) return false;
            if (a._set.size !== b._set.size) return false;
            let subset = true;
            a._set.forEach(v=>subset&&=b._set.has(v));
            if (!subset) return false;
            subset = true;
            b._set.forEach(v=>subset&&=a._set.has(v));
            return subset;
        }


        function createRefTypesTableLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, type?: RefTypesType): RefTypesTableLeaf {
            return {
                kind:RefTypesTableKind.leaf,
                symbol, isconst, type: type ?? createRefTypesType()
            };
        }
        function createRefTypesSymtab(): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>();
        }
        function copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>(symtab);
        }
        /**
         * Does NOT make a copy of target before modification.
         * @param param0
         */
        function mergeIntoRefTypesSymtab({source,target}: { source: Readonly<RefTypesSymtab>, target: RefTypesSymtab }): void {
            const iter=source.values();
            for (let next = iter.next(); !next.done; next=iter.next()){
                mergeLeafIntoRefTypesSymtab({ source: next.value.leaf, target });
            }
        }
        function mergeArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab {
            const target = createRefTypesSymtab();
            const symmap = new Map<Symbol, boolean>();
            arr.forEach(st=>{
                st.forEach((x,sym)=>symmap.set(sym, x.leaf.isconst??false));
            });
            symmap.forEach((isconst,sym)=>{
                arr.forEach(st=>{
                    const x = st.get(sym);
                    const sttype = x ? x?.leaf.type : createRefTypesType(getTypeOfSymbol(sym));
                    const y = target.get(sym);
                    if (y){
                        mergeToRefTypesType({ source:sttype, target:y.leaf.type });
                    }
                    else {
                        const leaf: RefTypesTableLeaf = {
                            kind:RefTypesTableKind.leaf,
                            symbol:sym,
                            isconst,
                            type:sttype
                        };
                        target.set(sym, { leaf });
                    }
                });
            });
            return target;
        }
        function mergeLeafIntoRefTypesSymtab({source,target}: { source: Readonly<RefTypesTableLeaf>, target: RefTypesSymtab }): void {
            if (!source.symbol) return;
            //const sourceSymbol = source.symbol!;
            const got = target.get(source.symbol);
            if (!got) target.set(source.symbol, { leaf: { ... source, type: copyRefTypesType(source.type) } });
            else {
                if (!(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst)){
                    Debug.assert(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst);
                }
                mergeToRefTypesType({ source: source.type, target: got.leaf.type });
            }
        }

        // function mergeArrRefTypesTableReturnToRefTypesTableNonLeaf(symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableNonLeaf {
        //     const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = arr.map(t=>{
        //         return [t.type,t.symtab];
        //     });
        //     return createRefTypesTableNonLeaf(symbol, isconst, arrTypeSymtab);
        // };
        /**
         * Requires: that every RefTypesTableReturn in "arr" have undefined values for symbol and isconst.
         * arr[i].type, for all i, will be merged (union).
         * arr[i].symtab, for all i, will be merged (union).
         * arr[i].constraintItem, for all i, will be merged (union) by joining under a single "or"-kind constraintItem
         *
         * @param symbol
         * @param isconst
         * @param arr
         * @returns
         */
        function mergeArrRefTypesTableReturnToRefTypesTableReturn({
            symbol, isconst, type:typeIn, arr, stripSymbols}: {
            symbol?: Symbol | undefined, isconst?: boolean | undefined, type?: RefTypesType, arr: Readonly<RefTypesTableReturn[]>, stripSymbols?: boolean}):
            RefTypesTableReturn {
            if (arr.length===0) Debug.fail("arr.length unexpectedly 0");
            if (!stripSymbols) {
                arr.forEach(rttr=>{
                    Debug.assert(rttr.symbol===undefined || rttr.symbol===symbol, "rttr.symbol!==undefined");
                    Debug.assert(rttr.isconst!==true || rttr.isconst===isconst, "rttr.isconst===true");
                });
            }
            if (arr.length===1){
                return arr[0];
            }
            const type = typeIn??createRefTypesType();
            const symtab = createRefTypesSymtab();
            const arrConstr: ConstraintItem[]=[];
            arr.forEach(rttr=>{
                if (!typeIn) mergeToRefTypesType({ source:rttr.type, target:type });
                mergeIntoRefTypesSymtab({ source: rttr.symtab, target: symtab });
                if (rttr.constraintItem) arrConstr.push(rttr.constraintItem);
            });
            const constraintItem: ConstraintItem = (arrConstr.length === 0) ? createFlowConstraintAlways() : (arrConstr.length === 1) ? arrConstr[0]: orIntoConstraints(arrConstr, mrNarrow);
            return {
                kind: RefTypesTableKind.return,
                symbol,
                isconst,
                type,
                symtab,
                constraintItem
            };
        };

        function dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string {
            const astr: string[]=[];
            forEachRefTypesTypeType(rt, t=>astr.push(typeToString(t)));
            return astr.join(" | ");
            // return typeToString(getTypeFromRefTypesType(rt));
        }
        function dbgConstraintItem(ci: ConstraintItem): string[] {
            Debug.assert(ci);
            //if (!ci) return ["undefined"];
            const as: string[]=["{"];
            as.push(` kind: ${ci.kind},`);
            if (ci.kind===ConstraintItemKind.never){/**/}
            else if (ci.kind===ConstraintItemKind.always){/**/}
            else if (ci.kind===ConstraintItemKind.leaf){
                as.push(`  symbol: ${dbgSymbolToStringSimple(ci.symbol)},`);
                as.push(`  type: ${dbgRefTypesTypeToString(ci.type)},`);
            }
            else {
                as.push(`  node: ${ci.op},`);
                if (ci.op===ConstraintItemNodeOp.not) {
                    as.push(`  constraint:`);
                    dbgConstraintItem(ci.constraint).forEach(s=>as.push("    " + s));
                    as[as.length-1] += ",";
                }
                else {
                    as.push(`  constraints:[`);
                    ci.constraints.forEach(ci1 => {
                        dbgConstraintItem(ci1).forEach(s=>as.push("    " + s));
                    });
                    as.push(`  ],`);
                }
            }
            as.push("},");
            return as;
        }
        function dbgRefTypesTableToStrings(rtt: RefTypesTable | undefined): string[] {
            if (!rtt) return ["undefined"];
            const as: string[]=["{"];
            as.push(`  kind: ${rtt.kind},`);
          if ((rtt as any).symbol) as.push(`  symbol: ${dbgSymbolToStringSimple((rtt as any).symbol)},`);
            if ((rtt as any).isconst) as.push(`  isconst: ${(rtt as any).isconst},`);
            if (isRefTypesTableLeaf(rtt)||isRefTypesTableReturn(rtt)){
                as.push(`  type: ${dbgRefTypesTypeToString(rtt.type)},`);
            }
            if (isRefTypesTableReturn(rtt)){
                dbgRefTypesSymtabToStrings(rtt.symtab).forEach((str,i)=>as.push(((i===0)?"  symtab: ":"  ")+str));
                if (!rtt.constraintItem){
                    as.push("  constraintItem: undefined");
                }
                else {
                    const ciss = dbgConstraintItem(rtt.constraintItem);
                    as.push("  constraintItem: " + ciss[0]);
                    ciss.slice(1).forEach(s=>as.push("    "+s));
                }
            }
            as.push("}");
            return as;
        }
        function dbgRefTypesSymtabToStrings(x: RefTypesSymtab): string[] {
            const as: string[]=["["];
            x.forEach((t,_s)=>{
                as.push("  "+dbgRefTypesTableToStrings(t.leaf).join(""));
            });
            as.push("]");
            return as;
        }




        function createNodeToTypeMap(): NodeToTypeMap {
            return new Map<Node,Type>();
        }
        function mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void {
            source.forEach((t,n)=>{
                const gott = target.get(n);
                if (!gott) target.set(n,t);
                else {
                    const tt = getUnionType([gott,t], UnionReduction.Literal);
                    target.set(n,tt);
                }
            });
        }

        /**
         *
         * @param type
         * @param crit
         * @returns type narrowed by criterion crit
         */
        // @ ts-ignore-error 6133
        function applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType,crit: InferCrit, func: F): void {
            if (crit.kind===InferCritKind.none) {
                forEachRefTypesTypeType(rt, t => {
                    func(t, /* pass */ true, /* fail */ false);
                });
            }
            else if (crit.kind===InferCritKind.truthy) {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.notnullundef) {
                const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
                const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.assignable) {
                forEachRefTypesTypeType(rt, source => {
                    let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                    if (crit.negate) rel = !rel;
                    func(source, rel, !rel);
                });
            }
            else if (crit.kind===InferCritKind.typeof) {
                forEachRefTypesTypeType(rt, type => {
                    if (type===anyType || type===unknownType){
                        func(type, /* pass */ true, /* fail */ true);
                        return;
                    }
                    else if (type===neverType){
                        func(type, /* pass */ false, /* fail */ false);
                        return;
                    }
                    let rel: boolean;
                    if (crit.typeofString===InferCritTypeofStrings.undefined) rel = (type===undefinedType);
                    else if (crit.typeofString===InferCritTypeofStrings.boolean) rel = !!(type.flags & TypeFlags.BooleanLike);
                    else if (crit.typeofString===InferCritTypeofStrings.number) rel = !!(type.flags & TypeFlags.NumberLike);
                    else if (crit.typeofString===InferCritTypeofStrings.bigint) rel = !!(type.flags & TypeFlags.BigIntLike);
                    else if (crit.typeofString===InferCritTypeofStrings.string) rel = !!(type.flags & TypeFlags.StringLike);
                    else if (crit.typeofString===InferCritTypeofStrings.symbol) rel = !!(type.flags & TypeFlags.ESSymbolLike);
                    else if (crit.typeofString===InferCritTypeofStrings.function || crit.typeofString===InferCritTypeofStrings.object) {
                        const isFunc = !!(checker.getSignaturesOfType(type, SignatureKind.Call).length || checker.getSignaturesOfType(type, SignatureKind.Construct).length);
                        const isObj = !!(type.flags & TypeFlags.Object);
                        if (crit.typeofString===InferCritTypeofStrings.function) rel = isFunc;
                        else rel = isObj && !isFunc;
                    }
                    else Debug.fail();
                    if (crit.negate) rel = !rel;
                    func(type, rel, !rel);
                });
            }
            else {
                Debug.assert(false, "cannot handle crit.kind ", ()=>crit.kind);
            }
        }

        /**
         *
         * If the value is omitted or is 0, -0, null, false, NaN, undefined, or the empty string (""),
         * return false type. All other values, return true type
         * @param uType
         */
        // @ts-ignore-error
        function convertNonUnionNonIntersectionTypeToBoolean(uType: Type): boolean {
            Debug.assert(!(uType.flags & TypeFlags.UnionOrIntersection));
            if (uType===undefinedType || uType===nullType) return false;
            // There is some ambiguity about boolean literal false
            if (uType.flags & TypeFlags.BooleanLiteral && (uType as IntrinsicType).intrinsicName==="false") return false;
            if (uType===checker.getFalseType()) return false;
            if (uType.flags & TypeFlags.StringLiteral && (uType as StringLiteralType).value==="") return false;
            if (uType.flags & TypeFlags.NumberLiteral && (
                (uType as NumberLiteralType).value===0 ||
                (uType as NumberLiteralType).value===-0 ||
                isNaN((uType as NumberLiteralType).value)
            )){
                return false;
            }
            return true;
        }


        /**
         *
         * @param param0
         */
        function mrNarrowTypesByTypeof({
            refTypesSymtab:refTypesSymtabIn, constraintItem, expr: typeofArgExpr, inferStatus: inferStatusIn
        }: Omit<InferRefInnerArgs, "qdotfallout">, negateCrit: boolean, typeString: string): MrNarrowTypesInnerReturn {
            const critTypeofString: InferCritTypeofStrings | undefined = (()=>{
                switch (typeString){
                    case InferCritTypeofStrings.undefined: return InferCritTypeofStrings.undefined;
                    case InferCritTypeofStrings.boolean: return InferCritTypeofStrings.boolean;
                    case InferCritTypeofStrings.number: return InferCritTypeofStrings.number;
                    case InferCritTypeofStrings.bigint: return InferCritTypeofStrings.bigint;
                    case InferCritTypeofStrings.string: return InferCritTypeofStrings.string;
                    case InferCritTypeofStrings.symbol: return InferCritTypeofStrings.symbol;
                    case InferCritTypeofStrings.function: return InferCritTypeofStrings.function;
                    case InferCritTypeofStrings.object: return InferCritTypeofStrings.object;
                }
            })();
            if (!critTypeofString) {
                return {
                    byNode: createNodeToTypeMap().set(typeofArgExpr, errorType),
                    arrRefTypesTableReturn: []
                };
            };
            const { inferRefRtnType: {passing,failing}, byNode } = mrNarrowTypes({
                refTypesSymtab: refTypesSymtabIn,
                constraintItem,
                expr: typeofArgExpr,
                crit: {
                    kind: InferCritKind.typeof,
                    typeofString: critTypeofString,
                    negate: negateCrit,
                    alsoFailing: true
                },
                qdotfallout: undefined,
                inferStatus: { ...inferStatusIn, inCondition:true }
            });
            const arrRefTypesTableReturn: RefTypesTableReturn[]=[];
            arrRefTypesTableReturn.push(passing , failing!);
            return {
                byNode,
                arrRefTypesTableReturn
            };
        }


        function mrNarrowTypesByBinaryExpression({
            refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            switch (operatorToken.kind) {
                case SyntaxKind.EqualsToken:
                case SyntaxKind.BarBarEqualsToken:
                case SyntaxKind.AmpersandAmpersandEqualsToken:
                case SyntaxKind.QuestionQuestionEqualsToken:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                    //return narrowTypeByTruthiness(narrowType(type, expr.right, assumeTrue), expr.left, assumeTrue);
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.EqualsEqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsEqualsToken:
                    if (leftExpr.kind === SyntaxKind.TypeOfExpression || rightExpr.kind === SyntaxKind.TypeOfExpression){
                        let typeofArgExpr: Expression | undefined;
                        let typeofString: string | undefined;
                        if (isTypeOfExpression(leftExpr) && isStringLiteral(rightExpr)){
                            typeofArgExpr = leftExpr.expression;
                            typeofString = rightExpr.text;
                        }
                        else if (isTypeOfExpression(rightExpr) && isStringLiteral(leftExpr)){
                            typeofArgExpr = rightExpr.expression;
                            typeofString = leftExpr.text;
                        }
                        if (typeofArgExpr && typeofString){
                            const negateCrit = operatorToken.kind===SyntaxKind.ExclamationEqualsEqualsToken || operatorToken.kind===SyntaxKind.ExclamationEqualsToken;
                            return mrNarrowTypesByTypeof({ refTypesSymtab:refTypesSymtabIn, expr:typeofArgExpr, inferStatus, constraintItem: constraintItemIn }, negateCrit, typeofString);
                        }
                        else {
                            // still required to process for side effects
                            const arrRttr: RefTypesTableReturn[]=[];
                            const byNode = createNodeToTypeMap();
                            const rl = mrNarrowTypesInner({ refTypesSymtab:refTypesSymtabIn, expr:leftExpr, qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn });
                            const rr = mrNarrowTypesInner({ refTypesSymtab:refTypesSymtabIn, expr:leftExpr, qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn });
                            mergeIntoNodeToTypeMaps(rl.byNode, byNode);
                            mergeIntoNodeToTypeMaps(rr.byNode, byNode);
                            arrRttr.push(...rl.arrRefTypesTableReturn);
                            arrRttr.push(...rr.arrRefTypesTableReturn);
                            return {
                                byNode, arrRefTypesTableReturn: arrRttr
                            };
                        }

                    }
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.InstanceOfKeyword:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    //return narrowTypeByInstanceof(type, expr, assumeTrue);
                    break;
                case SyntaxKind.InKeyword:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.CommaToken:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.BarBarToken:
                case SyntaxKind.AmpersandAmpersandToken:{
                    if (myDebug) consoleLog(`case SyntaxKind.(AmpersandAmpersand|BarBar)Token START`);
                    const {left:leftExpr,right:rightExpr}=binaryExpression;
                    if (myDebug) consoleLog(`case SyntaxKind.(AmpersandAmpersand|BarBar)Token left`);
                    const leftRet = mrNarrowTypes({
                        refTypesSymtab: refTypesSymtabIn,
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: leftExpr,
                        inferStatus,
                        constraintItem: constraintItemIn
                    });
                    const byNode = leftRet.byNode;

                    let arrRefTypesTableReturn: RefTypesTableReturn[];
                    if (myDebug) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left passing)`);
                    const leftTrueRightRet = mrNarrowTypes({
                        refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.passing.symtab),
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: rightExpr,
                        inferStatus,
                        constraintItem: leftRet.inferRefRtnType.passing.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(leftTrueRightRet.byNode, byNode);
                    const leftFalseRightRet = mrNarrowTypes({
                        refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.failing!.symtab),
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: rightExpr,
                        inferStatus,
                        constraintItem: leftRet.inferRefRtnType.failing!.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(leftFalseRightRet.byNode, byNode);
                    if (operatorToken.kind===SyntaxKind.AmpersandAmpersandToken){
                        arrRefTypesTableReturn = [
                            leftTrueRightRet.inferRefRtnType.passing,
                            leftTrueRightRet.inferRefRtnType.failing!,
                            { ...leftFalseRightRet.inferRefRtnType.passing, type:leftRet.inferRefRtnType.failing!.type },
                            { ...leftFalseRightRet.inferRefRtnType.failing!, type:leftRet.inferRefRtnType.failing!.type }
                        ];
                    }
                    else if (operatorToken.kind===SyntaxKind.BarBarToken){
                        arrRefTypesTableReturn = [
                            { ...leftTrueRightRet.inferRefRtnType.passing, type:leftRet.inferRefRtnType.passing.type },
                            { ...leftTrueRightRet.inferRefRtnType.failing!, type:leftRet.inferRefRtnType.passing.type },
                            leftFalseRightRet.inferRefRtnType.passing,
                            leftFalseRightRet.inferRefRtnType.failing!
                        ];
                    }
                    else Debug.fail();
                    arrRefTypesTableReturn.forEach(rttr=>{
                        rttr.symbol=undefined;
                        rttr.isconst=undefined;
                    });
                    return {
                        byNode,
                        arrRefTypesTableReturn,
                    };
                }
                    break;
                default:
                    Debug.fail("mrNarrowTypesByBinaryExpression, token kind not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));

            }
    }

        function mrNarrowTypesByCallExpression({refTypesSymtab:refTypesIn, constraintItem, expr:callExpr, /* crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {expr: CallExpression}): MrNarrowTypesInnerReturn {
            //return undefined as any as InferRefRtnType;
            Debug.assert(qdotfallout);
            // First duty is to call the precursors
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesIn, constraintItem, expr:callExpr, /*crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;
            if (myDebug) {
                consoleLog(`candidates by return of pre: [${prePassing.map(preRttr=>dbgRefTypesTypeToString(preRttr.type)).join(", ")}]`);
            }
            /**
             * Collect all of the individual signatures from each candidate to create a single signature candidate set.
             * PreAccess RefTypesTables should be correlated with signatures
             */
            const allSigAndContext: {
                sig: Signature,
                preRttr: RefTypesTableReturn,
            }[] = [];

            prePassing.forEach(rttr=>{
                const prePassingRefTypesType = rttr.type;
                forEachRefTypesTypeType(prePassingRefTypesType, (t: Type) => {
                    const sigs = checker.getSignaturesOfType(t, SignatureKind.Call);
                    if (sigs.length===0){
                        if (myDebug) consoleLog(`Error: ${typeToString(t)}, type mismatch, has no call signatures`);
                        // TODO: add error?
                        return;
                    }
                    /**
                     * If the number of sigs is 1 there are no overloads, but if it is more than one than there are overloads.
                     * In case of overloads skip the last one, because it is just union of all the others.
                     */
                    sigs.slice(0,/*Math.max(1, sigs.length-1)*/ sigs.length).forEach(s=>{
                        allSigAndContext.push({
                            sig: s,
                            preRttr: rttr
                        });
                    });
                });
            });

            /**
             * Perform the argument matching to each signature candidate as a separate virtual branch.
             *
             */
            type MatchedSigFail = & {
                pass: false;
                sig: Readonly<Signature>;
            };
            type MatchedSigPass = & {
                pass: true;
                sig: Readonly<Signature>;
                //refTypesRtn?: RefTypesReturn; // only when pass is true
                signatureReturnType: Type; // only when pass is true
                symtab: RefTypesSymtab; // only when pass is true
                constraintItem: ConstraintItem
                byNode: ESMap<Node,Type>; // only when pass is true
            };
            type MatchedSig = MatchedSigPass | MatchedSigFail;

            if (myDebug){
                consoleGroup("allSigAndContext:");
                allSigAndContext.map((x,idx)=>{
                    consoleLog(`[${idx}] type: ${dbgRefTypesTypeToString(x.preRttr.type)}`);
                    consoleLog(`[${idx}] sig: ${dbgSignatureToString(x.sig)}`);
                });
                consoleGroupEnd();
            }

            const matchedSigs = allSigAndContext.map((sigWithContext: Readonly<{
                sig: Signature,
                preRttr: RefTypesTableReturn,
                //byNode: ESMap<Node, Type>
            }>,_sigidx: number): MatchedSig => {
                const {sig, preRttr} = sigWithContext;
                let sargidx = -1;
                let sargRestElemType: Type | undefined;
                let sargRestSymbol: Symbol | undefined;
                /**
                 * Matching the arguments should ideally be a forward only matching,
                 * or at worst require a single "lookahead" that can be undone.
                 * Unfortunately, call parameters are not the same as tuples, so the same code cannot be used for both.
                 * This is allowed
                 * > declare function foo(a:number,b:number,...c:number[]):void;
                 * > foo(...[1,2]); // A spread argument must either have a tuple type or be passed to a rest parameter.(2556)
                 * > foo(...([1,2] as [number,number])); // No error
                 * > const tup:[number,number] = [1,2];
                 * > foo(...tup); // No error;
                 * > const tup2:[number,number,number,...number[]] = [1,2,3,4];
                 * > foo(...tup2); // No error;
                 * but I'm not clear on whether the expansion has already taken place before we get here. (Probably not).
                 * TODO: implement the expansion of tuples if required
                 */
                // Even with exactOptionalPropertyTypes: true, undefined can be passed to optional args, but not to a rest element.
                // But that is only because optional parameter types are forcibly OR'd with undefinedType early on.
                // foo(); // No error
                // foo(undefined); // No error
                // foo(undefined,undefined); // No error
                // foo(undefined,undefined,undefined);
                // //                      ^ // Argument of type 'undefined' is not assignable to parameter of type 'number'.(2345)

                if (signatureHasRestParameter(sig)) {
                    sargRestSymbol = sig.parameters.slice(-1)[0];
                    const sargRestType = getTypeOfSymbol(sig.parameters.slice(-1)[0]);
                    if (isArrayType(sargRestType)) sargRestElemType = getElementTypeOfArrayType(sargRestType)!;
                    Debug.assert(sargRestElemType, "Error: signatureHasRestParameter but couldn't get element type");
                }
                const sigParamsLength = sargRestElemType ? sig.parameters.length -1 : sig.parameters.length;
                const cargs = callExpr.arguments;
                const cargsNodeToType = createNodeToTypeMap();
                let sigargsRefTypesSymtab = preRttr.symtab;
                let sigargsConstraintItem = preRttr.constraintItem;
                let signatureReturnType: Type | undefined;

                const pass = cargs.every((carg,_cargidx)=>{
                    sargidx++;
                    if (sargidx>=sigParamsLength && !sargRestElemType) {
                        if (myDebug){
                            consoleLog(`Deferred Error: excess calling parameters starting at ${dbgNodeToString(carg)} in call ${dbgNodeToString(callExpr)}`);
                        }
                        return false;
                    }
                    //let targetSymbol: Symbol;
                    let targetType: Type;
                    let targetSymbol: Symbol;
                    if (sargidx<sigParamsLength){
                        targetSymbol = sig.parameters[sargidx];
                        targetType = getTypeOfSymbol(targetSymbol);
                    }
                    else {
                        targetSymbol = sargRestSymbol!; // not the element though
                        targetType = sargRestElemType!;
                    }
                    let targetTypeIncludesUndefined = false;
                    forEachTypeIfUnion(targetType, t=>{
                        if (t===undefinedType) targetTypeIncludesUndefined = true;
                    });
                    if (targetType===errorType){
                        if (myDebug) {
                            consoleLog(`Error: in signature ${
                                sig.declaration?dbgNodeToString(sig.declaration):"???"
                            }, definition of parameter ${targetSymbol.escapedName} is invalid`);
                        }
                        return false;
                    }
                    /**
                     * Check the result is assignable to the signature
                     */
                    const qdotfallout: RefTypesTableReturn[]=[];
                    const { inferRefRtnType: {passing,failing}, byNode } = mrNarrowTypes({
                        refTypesSymtab: sigargsRefTypesSymtab,
                        constraintItem: sigargsConstraintItem, // this is the constraintItem from mrNarrowTypesByCallExpression arguments
                        expr: carg,
                        crit: {
                            kind: InferCritKind.assignable,
                            target: targetType,
                            // negate: false,
                            alsoFailing:true,
                        },
                        qdotfallout,
                        inferStatus
                    });
                    mergeIntoNodeToTypeMaps(byNode, cargsNodeToType);
                    if (qdotfallout.length && !targetTypeIncludesUndefined){
                        consoleLog(
                            `Deferred Error: possible type of undefined/null can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    else if (failing && !isNeverType(failing.type)) {
                        consoleLog(
                            `Deferred Error: possible type of ${
                                typeToString(getTypeFromRefTypesType(failing.type))
                            } can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    sigargsRefTypesSymtab = copyRefTypesSymtab(passing.symtab); //createRefTypesSymtab();
                    sigargsConstraintItem = passing.constraintItem;

                    return true;
                });
                if (!pass){
                    return { pass:false, sig };
                }
                else {
                    if (sig.resolvedReturnType) signatureReturnType = sig.resolvedReturnType;
                    else signatureReturnType = getReturnTypeOfSignature(sig); // TODO: this could be problematic
                    cargsNodeToType.set(callExpr, signatureReturnType);
                    return { pass:true, sig, signatureReturnType, symtab: sigargsRefTypesSymtab, constraintItem:sigargsConstraintItem, byNode: cargsNodeToType };
                }
            });

            if (myDebug) {
                matchedSigs.forEach((ms,msidx)=>{
                    if (!ms.pass){
                        consoleGroup(`sig[${msidx}], pass:${ms.pass}`);
                    }
                    else {
                        consoleGroup(`sig[${msidx}], pass:${ms.pass}, rtnType: ${ms.signatureReturnType ? typeToString(ms.signatureReturnType):"N/A"}}`);
                    }
                    consoleGroup(dbgSignatureToString(ms.sig));
                    // if (ms.pass){
                    //     //dbgLogRefTypes();
                    // }
                    consoleGroupEnd();
                    consoleGroupEnd();
                });
            }
            const byNode = createNodeToTypeMap();
            // const mapTypeSymtab = new Map<RefTypesType,RefTypesSymtab>();
            const arrRttr: RefTypesTableReturn[]=[];
            const totalType = createRefTypesType();
            matchedSigs.forEach(ms=>{
                if (ms.pass) {
                    const type = createRefTypesType(ms.signatureReturnType);
                    arrRttr.push({
                        kind:RefTypesTableKind.return,
                        symbol:undefined,
                        type,
                        symtab: ms.symtab,
                        constraintItem: ms.constraintItem
                    });
                    mergeToRefTypesType({ source: type, target: totalType });
                    mergeIntoNodeToTypeMaps(ms.byNode, byNode);
                }
            });
            mergeIntoNodeToTypeMaps(pre.byNode, byNode);
            // KILL next line - This is also done upstairs in mrNarrowType/applyCritToArrRefTypesTableReturn
            byNode.set(callExpr, getTypeFromRefTypesType(totalType));
            // /**
            //  * TODO:
            //  * Do something so the queries on CallExpression yield only the passed signatures as valid candidates.
            //  * In no signatures are valid it is an error.
            //  */
            /**
             * Note: if there were no passed signatures then 'never' return type will (should) occur with no extra work.
             */
            return { arrRefTypesTableReturn: arrRttr, byNode };
        }

        type InferRefTypesPreAccessRtnType = & {
            kind: "immediateReturn",
            retval: MrNarrowTypesInnerReturn
        } | {
            kind: "normal",
            passing: RefTypesTableReturn[],
            byNode: ESMap<Node, Type>,
        };
        /**
         * In JS runtime
         *   {}.foo, [].foo, 1n.foo, "".foo, (1).foo (()=>1)().foo return undefined
         *   1.foo, undefined.foo, null.foo, (undefined).foo, (null).foo -> TypeError runtime exception
         * InferRefTypesPreAccess assists in handling the predecessor `return undefined` branch, if present, by pushing that `undefined` branch
         * to `qdotfallout` if `questionDotToken` is defined, othwise producing an an Error. By default that branch processing is then finsihed for the caller.
         * If undefined is the only branch then {kind:"immediateReturn", retval} is returned, with an appropriate value for retval.
         * Otherwise {kind:"normal", passing} is returned, where `passing` is the predecessor passing branch.
         * @param param0
         * @param symbolOfRtnType
         * @returns
         */
        function InferRefTypesPreAccess({refTypesSymtab: refTypes, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs & {expr: {expression: Expression}}): InferRefTypesPreAccessRtnType{
            const { inferRefRtnType:{ passing, failing }, byNode:byNodePre } = mrNarrowTypes(
                { refTypesSymtab: refTypes, expr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout, inferStatus,constraintItem });
            Debug.assert(failing);
            if (!isNeverType(failing.type)){
                if (isPropertyAccessExpression(condExpr) && condExpr.questionDotToken){
                    qdotfallout.push(failing); // The caller of InferRefTypesPreAccess need deal with this no further.
                }
                else {
                    /**
                     * If isNeverType and if !condExpr.questionDotToken, then what should happen to the failing node value in byNode?
                     * Doesn't matter if there is going to be an error anyway.
                     */
                    if (myDebug) consoleLog(`Error: expression ${dbgNodeToString(condExpr)} cannot be applied to undefined or null.  Add '?' or '!' if appropriate.`);
                }
            }
            if (isNeverType(passing.type)){
                return { kind:"immediateReturn", retval: { arrRefTypesTableReturn:[], byNode: byNodePre } };
            }
            return { kind:"normal", passing: [passing], byNode: byNodePre };
        }

        function mrNarrowTypesByPropertyAccessExpression({refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (myDebug) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem });
            if (myDebug) {
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypesByPropertyAccessExpression_aux({refTypesSymtab:refTypesSymtabIn, expr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            /**
             * It doesn't really make much sense for the PropertyAccessExpression to have a symbol because the property name is simply a key
             * that may be used to lookup across totally unrelated objects that are present only ambiently in the code - unless the precursor is a constant.
             * In that way it not so much different from a call expression, which never has a symbol.
             *
             * On the other hand, if the looked up properties are symbols - which the standard case - then it doesn't make sense to ignore those symbols because they may correspond to
             * identifiers with symbol and constrained values that should be added to the refTypes if not already there -
             * and if already existing in refTypes then the possibly narrowed existing type range should be
             * used to constrain the return value (rather than the declared value.)
             *
             * For the above reasons we will ignore the symbol `getNodeLinks(condExpr).resolvedSymbol;`
             * but address any looked-up property symbols as discussed above.
             *
             * An implication is that constraints imposed by crit or successor NonNullExpression (!) operator must be applied to multiple symbols if neccesary,
             * so `symbolOfRtnType` must be changed `symbolsOfRtnType`.
             */
            Debug.assert(isPropertyAccessExpression(expr));
            Debug.assert(expr.expression);
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesSymtabIn, constraintItem, expr, /* crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            /**
             * Each lookup should be treated as a separate virtual branch, with it's own RefTypesReturn, because the crit might distinguish between them.
             * We get by here with arrTypeSymtab, only because the symtab is added to directly: `refTypesSymtab.set(propSymbol, value); `
             *
             * In replayMode, we don't use the node type from byNode here for two reasons -
             * (1) The node type is already squashed so the infer info is lost
             * (2) We don't need it, because the types passed back from preAccess must be correct - identical to what is here (only squashed). Can be verified.
.             * */
            const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean, narrowable?: boolean}[]=[];
            const keystr = expr.name.escapedText as string;
            const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = []; //
            const arrRttr: RefTypesTableReturn[]=[];
            pre.passing.forEach(prePassing=>{
                /**
                 * Each prePassing.type is a potential compound type.  For each primitive type of that compound type, a new branch is generated.
                 * For each new branch a RefTypesTableReturn is created and pushed to arrRttr.
                 *
                 */
                const preRefTypesSymtab = prePassing.symtab;
                const preConstraintItemNode = prePassing.constraintItem;
                forEachRefTypesTypeType(prePassing.type, t => {
                    if (t===undefinedType||t===nullType) {
                        Debug.assert(false);
                    }
                    if (!(t.flags & TypeFlags.Object) && t!==stringType){
                        let tstype: Type;
                        if (t===numberType) tstype = errorType;  // special case ERROR TYPE for t===numberType
                        else tstype = undefinedType;
                        const type = createRefTypesType(tstype);
                        accessedTypes.push({ baseType: t, type:tstype, lookupFail: true, optional:false });
                        arrTypeSymtab.push([createRefTypesType(undefinedType), preRefTypesSymtab]);
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type,
                            symtab: preRefTypesSymtab,
                            constraintItem: preConstraintItemNode
                        });
                        return;
                    }
                    if (isArrayOrTupleType(t)||t===stringType) {
                        if (keystr==="length") {
                            accessedTypes.push({ baseType: t, type:numberType, optional:false });
                            arrTypeSymtab.push([createRefTypesType(numberType), preRefTypesSymtab]);
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                type: createRefTypesType(numberType),
                                symtab: preRefTypesSymtab,
                                constraintItem: preConstraintItemNode
                            });
                        }
                        else {
                            accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                            arrTypeSymtab.push([createRefTypesType(undefinedType), preRefTypesSymtab]);
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                type: createRefTypesType(undefinedType),
                                symtab: preRefTypesSymtab,
                                constraintItem: preConstraintItemNode
                            });
                        };
                        return;
                    }
                    /**
                     * Add propSymbol, resolvedType to a copy of refTypesSymtab
                     *
                     */
                    const propSymbol = checker.getPropertyOfType(t, keystr);
                    if (propSymbol) {
                        let readonlyProp = isReadonlyProperty(propSymbol);
                        const optionalProp = !!(propSymbol.flags & SymbolFlags.Optional);
                        const declaredType = getTypeOfSymbol(propSymbol);
                        //const declaredType = createRefTypesType(getTypeOfSymbol(propSymbol));
                        let resolvedType = createRefTypesType(declaredType);
                        let narrowable = optionalProp || declaredType===anyType || !!(declaredType.flags & TypeFlags.Union);

                        const declarations = propSymbol.declarations;
                        if (declarations){
                            const kind: SyntaxKind = declarations[0].kind;
                            readonlyProp ||= !!(kind===SyntaxKind.MethodSignature); // e.g. { foo():number[]; }, foo cannot be changed
                            narrowable &&= (kind!==SyntaxKind.MethodSignature); // MethodSignature are invariant, including overloads.
                            if (declarations.length>1){
                                Debug.assert(declarations.every(d=>d.kind===SyntaxKind.MethodSignature)); // could only be overloads?
                            }
                        }
                        /**
                         * TODO: resolved type should also be narrowed by constraintItem.
                         *
                         */
                        let value = preRefTypesSymtab.get(propSymbol);
                        if (value){
                            resolvedType = value.leaf.type;
                            Debug.assert(value.leaf.isconst===readonlyProp);
                        }
                        else {
                            if (myDebug) {
                                consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: adding new symbol to ref types, {symbol:<${
                                    propSymbol.escapedName},${getSymbolId(propSymbol)}>, type ${typeToString(declaredType)}, const:${readonlyProp}`);
                            }
                            value = { leaf: { kind: RefTypesTableKind.leaf, symbol: propSymbol, isconst:readonlyProp, type: resolvedType } };
                            inferStatus.declaredTypes.set(propSymbol,value.leaf);
                        }
                        arrTypeSymtab.push([resolvedType, preRefTypesSymtab]);
                        accessedTypes.push({ baseType: t, type: getTypeFromRefTypesType(resolvedType), declaredType, optional: optionalProp, readonlyProp, narrowable });
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: propSymbol,
                            isconst: readonlyProp,
                            type: value.leaf.type,
                            symtab: preRefTypesSymtab,
                            constraintItem: preConstraintItemNode
                        });
                    return;
                    }
                    Debug.assert(false);
                });
            });

            if (myDebug){
                consoleLog(`propertyTypes:`);
                accessedTypes.forEach(t=> {
                    consoleLog(`baseType:${typeToString(t.baseType)}, propType:${typeToString(t.type)}, optional:${t.optional}, lookupFail:${t.lookupFail}, readonlyProp: ${t.readonlyProp}, narrowable: ${t.narrowable} `);
                });
                consoleLog(`end propertyTypes:`);
            }
            const hasFailedLookup = accessedTypes.some(x=>x.lookupFail);
            const hasSuccessLookup = accessedTypes.some(x=>!x.lookupFail);
            let requirePropertyDefinedForEachSubtype = false;
            requirePropertyDefinedForEachSubtype = false;
            if (requirePropertyDefinedForEachSubtype && hasFailedLookup){
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: some lookup(s) were unsuccessful`);
            }
            else if (!hasSuccessLookup){
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: no lookups were successful`);
            }
            const totalType = createRefTypesType();
            arrRttr.forEach(rttr=>mergeToRefTypesType({ source: rttr.type, target: totalType }));
            pre.byNode.set(expr, getTypeFromRefTypesType(totalType));

            return { arrRefTypesTableReturn: arrRttr, byNode: pre.byNode };
        }


        /**
         *
         * @param arrRttr
         * @param crit
         * @returns
         */

        /**
         * If "rttr.symbol" is defined and "rtti.isconst" is true,
         * then and/simplify "rtti.constraint" and "rtti.symtab" with assertion "type of rtti.symbol is in rtti.type"
         * @param rttr
         * @returns type RefTypesTableReturnCritOut which has no "symbol" or "isconst" members.
         *
         */
        const mergeTypeIntoNewSymtabAndNewConstraint = (rttr: Readonly<RefTypesTableReturn /* & {symbol: Symbol}*/ >, inferStatus: InferStatus): RefTypesTableReturnNoSymbol => {
            Debug.assert(rttr.symbol);
            const { type, symbol, isconst } = rttr;
            let { symtab, constraintItem: tmpConstraintItem } = rttr;
            let setTypeTmp = type;
            if (symbol && isconst) {
                const got = symtab.get(symbol);
                if (got) setTypeTmp = intersectRefTypesTypes(got.leaf.type, type);
                const declType = inferStatus.declaredTypes.get(symbol)?.type;
                if (!declType){
                    Debug.assert(declType);
                }
                if (true){
                    // Would running evalTypeOverConstraint help? It doesn't seem to change the type.  This development test assert the tye-p is not changed.
                    const setTypeTmpCheck = evalTypeOverConstraint({ cin:tmpConstraintItem, symbol, typeRange: setTypeTmp, mrNarrow });
                    if (mrNarrow.isASubsetOfB(setTypeTmpCheck, setTypeTmp) && !mrNarrow.isASubsetOfB(setTypeTmp, setTypeTmpCheck)){
                        Debug.fail();
                    }
                    if (mrNarrow.isASubsetOfB(setTypeTmp, setTypeTmpCheck) && !mrNarrow.isASubsetOfB(setTypeTmpCheck, setTypeTmp)){
                        Debug.fail();
                    }
                }
                const refCountIn = [0] as [number];
                const refCountOut = [0] as [number];
                tmpConstraintItem = andDistributeDivide({ symbol, type: setTypeTmp, declaredType: declType, cin: tmpConstraintItem, mrNarrow, refCountIn, refCountOut });

                if (true){
                    // Would running evalTypeOverConstraint help? It doesn't seem to change the type.  This development test assert the tye-p is not changed.
                    const setTypeTmpCheck = evalTypeOverConstraint({ cin:tmpConstraintItem, symbol, typeRange: setTypeTmp, mrNarrow });
                    if (mrNarrow.isASubsetOfB(setTypeTmpCheck, setTypeTmp) && !mrNarrow.isASubsetOfB(setTypeTmp, setTypeTmpCheck)){
                        Debug.fail();
                    }
                    if (mrNarrow.isASubsetOfB(setTypeTmp, setTypeTmpCheck) && !mrNarrow.isASubsetOfB(setTypeTmpCheck, setTypeTmp)){
                        Debug.fail();
                    }
                }

                // We don't necessary to "and" into the constrint here - it could be posponed untli multiple branches or "or"'ed together.
                // However it is sufficient. Although it might not be opitmal in terms of constraint size. todo?.
                if (!mrNarrow.isASubsetOfB(declType,setTypeTmp)) {
                    tmpConstraintItem = andIntoConstraint({ symbol, type: setTypeTmp, constraintItem: tmpConstraintItem, mrNarrow });
                }
                symtab = copyRefTypesSymtab(rttr.symtab);
                symtab.set(
                    symbol,
                    {leaf: {
                        kind: RefTypesTableKind.leaf,
                        symbol,
                        isconst,
                        type: setTypeTmp,
                    },
                });
            }
            return { kind:RefTypesTableKind.return, symtab, type: setTypeTmp, constraintItem: tmpConstraintItem };
        };

        /**
         * "arrRttr" is an array of type RefTypesTableReturn that are implicitly or-ed together - they are alternate assertions about symbol+type constraints.
         * "crit" projects the net or-ed result onto passing and (optionally) failing assertions.
         * "_inferStatus" is obsolete.
         * The return values {passing, failing} are each arrays of length no larger than 1. (TODO??: return undefined or value instead of array)
         */
        function applyCritToArrRefTypesTableReturn(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, inferStatus: InferStatus): {
            passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol, unmerged?: Readonly<RefTypesTableReturn[]>
        }{
            if (arrRttr.length===0) {
                Debug.assert(false);
            }
            Debug.assert(!(crit.kind===InferCritKind.none && crit.negate));
            {
                // all other crit kinds
                const arrRttrcoPassing: RefTypesTableReturnNoSymbol[] = [];
                const arrRttrcoFailing: RefTypesTableReturnNoSymbol[] = [];
                arrRttr.forEach(rttr=>{
                    let localSymtabPassing: RefTypesSymtab | undefined;
                    const localTypePassing = createRefTypesType();
                    let localSymtabFailing: RefTypesSymtab | undefined;
                    const localTypeFailing = createRefTypesType();
                    applyCritToRefTypesType(rttr.type, crit, (tstype, bpass, bfail)=>{
                        if (bpass) {
                            addTypeToRefTypesType({ source: tstype, target: localTypePassing });
                            localSymtabPassing = rttr.symtab;
                        }
                        if (crit.alsoFailing && bfail) {
                            addTypeToRefTypesType({ source: tstype, target: localTypeFailing });
                            localSymtabFailing = rttr.symtab;
                        }
                    });
                    if (!rttr.symbol){
                        if (!isNeverType(localTypePassing)){
                            arrRttrcoPassing.push({
                                kind: RefTypesTableKind.return,
                                type: localTypePassing,
                                symtab: localSymtabPassing ?? createRefTypesSymtab(),
                                //isconst: rttr.isconst,
                                constraintItem: rttr.constraintItem
                            });
                        }
                        if (!isNeverType(localTypeFailing)){
                            arrRttrcoFailing.push({
                            kind: RefTypesTableKind.return,
                            type: localTypeFailing,
                            symtab: localSymtabFailing ?? createRefTypesSymtab(),
                            //isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                            });
                        }
                    }
                    else {
                        arrRttrcoPassing.push(mergeTypeIntoNewSymtabAndNewConstraint({
                            kind: RefTypesTableKind.return,
                            symbol: rttr.symbol,
                            type: localTypePassing,
                            symtab: localSymtabPassing ?? createRefTypesSymtab(),
                            isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                        }, inferStatus));
                        arrRttrcoFailing.push(mergeTypeIntoNewSymtabAndNewConstraint({
                            kind: RefTypesTableKind.return,
                            symbol: rttr.symbol,
                            type: localTypeFailing,
                            symtab: localSymtabFailing ?? createRefTypesSymtab(),
                            isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                        }, inferStatus));

                    }
                });
                const rttrcoPassing: RefTypesTableReturnNoSymbol = {
                    kind: RefTypesTableKind.return,
                    symtab: createRefTypesSymtab(),
                    type: createRefTypesType(), // never
                    constraintItem: createFlowConstraintAlways(),
                };
                const passingOredConstraints: ConstraintItem[] = [];
                arrRttrcoPassing.forEach(rttr2=>{
                    mergeIntoRefTypesSymtab({ source:rttr2.symtab, target:rttrcoPassing.symtab });
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoPassing.type });
                    if (rttr2.constraintItem) passingOredConstraints.push(rttr2.constraintItem);
                });
                if (isNeverType(rttrcoPassing.type)) rttrcoPassing.constraintItem = createFlowConstraintNever();
                else if (passingOredConstraints.length===1) rttrcoPassing.constraintItem = passingOredConstraints[0];
                else if (passingOredConstraints.length) rttrcoPassing.constraintItem = orIntoConstraints(passingOredConstraints, mrNarrow);
                const rttrcoFailing: RefTypesTableReturnNoSymbol = {
                    kind: RefTypesTableKind.return,
                    symtab: createRefTypesSymtab(),
                    type: createRefTypesType(), // never
                    constraintItem: createFlowConstraintAlways(),
                };
                const failingOredConstraints: ConstraintItem[] = [];
                arrRttrcoFailing.forEach(rttr2=>{
                    mergeIntoRefTypesSymtab({ source:rttr2.symtab, target:rttrcoFailing.symtab });
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoFailing.type });
                    if (rttr2.constraintItem) failingOredConstraints.push(rttr2.constraintItem);
                });
                if (isNeverType(rttrcoFailing.type)) rttrcoFailing.constraintItem = createFlowConstraintNever();
                if (failingOredConstraints.length===1) rttrcoFailing.constraintItem = failingOredConstraints[0];
                else if (failingOredConstraints.length) rttrcoFailing.constraintItem = orIntoConstraints(failingOredConstraints, mrNarrow);
                const rtn: ReturnType<typeof applyCritToArrRefTypesTableReturn>  = { passing:rttrcoPassing };
                if (crit.alsoFailing){
                    rtn.failing = rttrcoFailing;
                }
                if (crit.kind===InferCritKind.none && inferStatus.inCondition){
                    rtn.unmerged = arrRttr;
                }
                return rtn;
            }
            Debug.fail(`crit.kind:${crit.kind}`);
        };

        /**
         * @param param0
         * @returns
         */
        function mrNarrowTypes({refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr:expr, inferStatus, crit: critIn, qdotfallout: qdotfalloutIn }: InferRefArgs): MrNarrowTypesReturn {
            myDebug = getMyDebug();
            if (myDebug) {
                consoleLog(`mrNarrowTypes[in] qdotfalloutIn: ${!qdotfalloutIn ? "<undef>" : `length: ${qdotfalloutIn.length}`}`);
                consoleLog(`mrNarrowTypes[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`  ${str}`));
                consoleLog(`mrNarrowTypes[in] constraintItemIn:`);
                if (constraintItemIn) dbgConstraintItem(constraintItemIn).forEach(str=> consoleLog(`  ${str}`));
            }
            const qdotfallout = qdotfalloutIn??([] as RefTypesTableReturn[]);
            const innerret = mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr, qdotfallout,
                inferStatus });
            let finalArrRefTypesTableReturn = innerret.arrRefTypesTableReturn;
            if (myDebug){
                consoleLog(`mrNarrowTypes[dbg]: qdotfallout.length: ${qdotfallout.length}`);
                qdotfallout.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`mrNarrowTypes[dbg]:  qdotfallout[${i}]: ${str}`);
                    });
                });
            }
            if (!qdotfalloutIn){
                /**
                 * !qdotfallout so merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit
                 */
                if (myDebug){
                    consoleLog("mrNarrowTypes[dbg]: Merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit");
                    qdotfallout.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(str=>{
                            consoleLog(`mrNarrowTypes[dbg]:  qdotfallout[${i}]: ${str}`);
                        });
                    });
                }
                finalArrRefTypesTableReturn = [...qdotfallout, ...innerret.arrRefTypesTableReturn];
            }
            /**
             * Apply the crit before handling the replayResult (if any)
             */
            const crit = { ...critIn };
            const critret = applyCritToArrRefTypesTableReturn(finalArrRefTypesTableReturn, crit, inferStatus);

            const nodeType = copyRefTypesType(critret.passing.type);
            if (critret.failing) mergeToRefTypesType({ source:critret.failing.type, target:nodeType });
            const mrNarrowTypesReturn: MrNarrowTypesReturn  = {
                byNode: innerret.byNode.set(expr,getTypeFromRefTypesType(nodeType)),
                inferRefRtnType: { passing: critret.passing }
            };
            if (critret.failing) mrNarrowTypesReturn.inferRefRtnType.failing=critret.failing;
            if (critret.unmerged) mrNarrowTypesReturn.inferRefRtnType.unmerged=critret.unmerged;

            if (myDebug) {
                consoleLog("mrNarrowTypes[out]: mrNarrowTypesReturn.inferRefRtnType.passing:");
                dbgRefTypesTableToStrings(mrNarrowTypesReturn.inferRefRtnType.passing).forEach(s=>consoleLog("  mrNarrowTypes[dbg]: passing:  "+s));
                consoleLog("mrNarrowTypes[out]:mrNarrowTypesReturn.inferRefRtnType.failing:");
                dbgRefTypesTableToStrings(mrNarrowTypesReturn.inferRefRtnType.failing).forEach(s=>consoleLog("  mrNarrowTypes[dbg]: failing:  "+s));
                if (mrNarrowTypesReturn.inferRefRtnType.unmerged){
                    mrNarrowTypesReturn.inferRefRtnType.unmerged.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`  mrNarrowTypes[dbg]: unmerged[${i}]: ${s}`));
                    });
                }
                consoleGroup("mrNarrowTypes[out] mrNarrowTypesReturn.byNode:");
                mrNarrowTypesReturn.byNode.forEach((t,n)=>{
                    consoleLog(`mrNarrowTypes[out] byNode: node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                });
                consoleGroupEnd();
                consoleLog(`mrNarrowTypes[out] ${dbgNodeToString(expr)}`);
                consoleGroupEnd();
            }
            return mrNarrowTypesReturn;
        }

        function mrNarrowTypesInner({refTypesSymtab: refTypesSymtabIn, expr: expr, qdotfallout, inferStatus, constraintItem }: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (myDebug){
                consoleGroup(`mrNarrowTypesInner[in] expr:${dbgNodeToString(expr)}, inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayableItem:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}`);
                consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:  ${str}`));
                consoleLog(`mrNarrowTypesInner[in] constraintItemIn:`);
                if (constraintItem) dbgConstraintItem(constraintItem).forEach(str=> consoleLog(`mrNarrowTypesInner[in] constraintItemIn:  ${str}`));
            }
            const innerret = mrNarrowTypesInnerAux({ refTypesSymtab: refTypesSymtabIn, expr, qdotfallout, inferStatus, constraintItem });
            if (myDebug){
                innerret.arrRefTypesTableReturn.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`mrNarrowTypesInner[out]:  innerret.arttr[${i}]: ${str}`);
                    });
                });
                innerret.byNode.forEach((type,node)=>{
                    consoleLog(`mrNarrowTypesInner[out]:  innerret.byNode: { node: ${dbgNodeToString(node)}, type: ${typeToString(type)}`);
                });
                if (innerret.assignmentData){
                    consoleLog(`mrNarrowTypesInner[out]: innerret.assignmentData: { symbol: ${
                        dbgSymbolToStringSimple(innerret.assignmentData?.symbol)
                    }, isconst: ${
                        innerret.assignmentData?.isconst
                    }`);
                }
                else {
                    consoleLog(`mrNarrowTypesInner[out]: innerret.assignmentData: <undef>`);
                }
                consoleLog(`mrNarrowTypesInner[out] expr:${dbgNodeToString(expr)}, inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayableItem:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}`);
                consoleGroupEnd();
            }
            return innerret;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypesInnerAux({refTypesSymtab: refTypesSymtabIn, expr, qdotfallout, inferStatus, constraintItem:constraintItemIn}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            switch (expr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    if (myDebug) consoleLog(`case SyntaxKind.Identifier`);
                    Debug.assert(isIdentifier(expr));
                    const symbol = getResolvedSymbol(expr); // getSymbolOfNode()?

                    if (inferStatus.replayables.has(symbol)){
                        if (getMyDebug()){
                            consoleLog(`mrNarrowTypesInner[dbg]: start replay for ${dbgSymbolToStringSimple(symbol)}`);
                        }
                        const replayable = inferStatus.replayables.get(symbol)!;
                        // replay with new constraints
                        const rhs = mrNarrowTypes({
                            expr: replayable?.expr,
                            crit: { kind:InferCritKind.none },
                            refTypesSymtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn,
                            qdotfallout: undefined,
                            inferStatus: { ...inferStatus, inCondition:true, currentReplayableItem:replayable }
                        });
                        if (getMyDebug()){
                            consoleLog(`mrNarrowTypesInner[dbg]: end replay for ${dbgSymbolToStringSimple(symbol)}`);
                        }

                        Debug.assert(!rhs.inferRefRtnType.failing);
                        Debug.assert(rhs.inferRefRtnType.unmerged);
                        const byNode = createNodeToTypeMap().set(expr, getTypeFromRefTypesType(rhs.inferRefRtnType.passing.type));
                        const arrRefTypesTableReturn = inferStatus.inCondition ? rhs.inferRefRtnType.unmerged : [rhs.inferRefRtnType.passing];
                        return {
                            byNode,
                            arrRefTypesTableReturn
                        };
                    }
                    let type: RefTypesType | undefined;
                    let isconst = false;
                    let tstype: Type | undefined;
                    let leaf = refTypesSymtabIn.get(symbol)?.leaf;
                    if (!leaf){
                        leaf = inferStatus.declaredTypes.get(symbol);
                    }
                    if (!leaf){
                        const tstype = getTypeOfSymbol(symbol); // Is it OK for Identifier, will it not result in error TS7022 ?
                        if (tstype===errorType){
                            Debug.assert(false);
                        }
                        type = createRefTypesType(tstype);
                        isconst = isConstantReference(expr);
                        leaf = createRefTypesTableLeaf(symbol,isconst,type);
                        inferStatus.declaredTypes.set(symbol, leaf);
                    }
                    else {
                        type = leaf.type;
                        isconst = leaf.isconst??false;
                    }
                    if (inferStatus.currentReplayableItem){
                        // If the value of the symbol has definitely NOT changed since the defintion of the replayable.
                        // then we can continue on below to find the value via constraints.  Otherwise, we must use the value of the symbol
                        // at the time of the definition of the replayable, as recorded in the replayables byNode map.
                        if (!isconst){
                            const tstype = inferStatus.currentReplayableItem.nodeToTypeMap.get(expr)!;
                            Debug.assert(type);
                            type = createRefTypesType(tstype);
                            return {
                                byNode: createNodeToTypeMap().set(expr, tstype),
                                arrRefTypesTableReturn:[{
                                    kind: RefTypesTableKind.return,
                                    // symbol and isconst are not passed back
                                    type,
                                    symtab: refTypesSymtabIn,
                                    constraintItem: constraintItemIn
                                }],
                            };
                        }
                    }

                    {

                        if (isconst && constraintItemIn){
                            // Could this narrowing be postponed until applyCritToArrRefTypesTableReturn? No.
                            // If done here, then the constrained result is reflected in byNode.  That could result in better error messages if it were never.
                            // However, the constraintItem is postponed until applyCritToArrRefTypesTableReturn.
                            type = evalTypeOverConstraint({ cin:constraintItemIn, symbol, typeRange: type, mrNarrow });
                            // if (type !== leaf.type && !mrNarrow.isASubsetOfB(leaf.type,type)){
                            //     refTypesSymtabOut = copyRefTypesSymtab(refTypesSymtabOut).set(symbol,{ leaf:createRefTypesTableLeaf(symbol,isconst,type) });
                            // }
                        }
                        tstype = getTypeFromRefTypesType(type);
                    }
                    const byNode = createNodeToTypeMap();
                    byNode.set(expr, tstype);
                    const rttr: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol,
                        isconst,
                        type,
                        symtab: refTypesSymtabIn,
                        constraintItem: constraintItemIn
                    };
                    const mrNarrowTypesInnerReturn: MrNarrowTypesInnerReturn = {
                        byNode,
                        arrRefTypesTableReturn: [rttr],
                        assignmentData: {
                            isconst,
                            symbol
                        }
                    };
                    return mrNarrowTypesInnerReturn;

                }
                /**
                 * NonNullExpression
                 */
                case SyntaxKind.NonNullExpression: {
                    Debug.assert(isNonNullExpression(expr));
                    /**
                     * Typescript documentation on "Non-null assertion operator":
                     * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
                     * > A new ! post-fix expression operator may be used to assert that its operand
                     * > is non-null and non-undefined in contexts where the type checker is unable
                     * > to conclude that fact. Specifically, the operation x! produces a value of
                     * > the type of x with null and undefined excluded. Similar to type assertions
                     * > of the forms <T>x and x as T, the ! non-null assertion operator is simply
                     * > removed in the emitted JavaScript code.
                     * However, the operator precedence was not specified in the documentation.
                     * Should it be the same as the ? operator (defined by JS runtime), binding only to the last element?
                     * In that case `qdotfallout` are not filtered here.
                     *
                     * It could be defined to apply to all preceding elements in a chain.
                     * That would require defining the limits of the chain -
                     * Does that cross getters, elements access, parentheses, call expressions, etc?
                     * In that case `qdotfallout` would filtered here, and the chain limits are where `qdotfallout` are terminated.
                     * It would be easy enough to filter `qdotfallout` here if required for, e.g., back compat.
                     *
                     *
                     */
                     const innerret = mrNarrowTypesInner({refTypesSymtab: refTypesSymtabIn, expr: expr.expression,
                        //crit: {kind: InferCritKind.twocrit, crits:[{ kind:InferCritKind.notnullundef }, crit]},
                        qdotfallout, inferStatus, constraintItem: constraintItemIn });

                    /**
                     * Apply notnullundef criteria without squashing the result into passing/failing
                     * Note that innerret.byNode is not altered, under the assumption that byNode does not yet include the types to be discriminated.
                     */
                    const applyNotNullUndefCritToRefTypesTableReturn = (arrRttr: Readonly<RefTypesTableReturn[]>): Readonly<RefTypesTableReturn[]> => {
                        const arrOut: RefTypesTableReturn[] = [];
                        arrRttr.forEach(rttr=>{
                            const type = createRefTypesType();
                            applyCritToRefTypesType(rttr.type,{ kind: InferCritKind.notnullundef }, (tstype, bpass, _bfail)=>{
                                if (bpass) addTypeToRefTypesType({ source:tstype,target:type });
                            });
                            if (!isNeverType(type)){
                                arrOut.push({
                                    ... rttr,
                                    type
                                });
                            }

                        });
                        return arrOut;
                    };
                    return {
                        byNode: innerret.byNode,
                        arrRefTypesTableReturn: applyNotNullUndefCritToRefTypesTableReturn(innerret.arrRefTypesTableReturn),
                        //arrTypeAndConstraint: innerret.arrTypeAndConstraint
                    };
                }
                case SyntaxKind.ParenthesizedExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case ParenthesizedExpression [start]`);
                    const ret = mrNarrowTypes({ refTypesSymtab: refTypesSymtabIn, expr: (expr as ParenthesizedExpression).expression,
                        crit: inferStatus.inCondition ? { kind: InferCritKind.truthy, alsoFailing: true } : { kind: InferCritKind.none },
                        inferStatus, constraintItem: constraintItemIn });
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case ParenthesizedExpression [end]`);
                    const arrRefTypesTableReturn = [ret.inferRefRtnType.passing];
                    if (ret.inferRefRtnType.failing) arrRefTypesTableReturn.push(ret.inferRefRtnType.failing);
                    return {
                        byNode: ret.byNode,
                        arrRefTypesTableReturn,
                    };
                }
                break;
                /**
                 * ConditionalExpression
                 */
                case SyntaxKind.ConditionalExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression`);
                    const {condition, whenTrue, whenFalse} = (expr as ConditionalExpression);
                    const byNodeSinglepath = createNodeToTypeMap();
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; condition:${dbgNodeToString(condition)}`);
                    const rcond = mrNarrowTypes({
                        refTypesSymtab: refTypesSymtabIn,
                        expr: condition,
                        crit: { kind: InferCritKind.truthy, alsoFailing: true },
                        inferStatus: { ...inferStatus, inCondition: true },
                        constraintItem: constraintItemIn
                    });
                    mergeIntoNodeToTypeMaps(rcond.byNode, byNodeSinglepath);
                    //andIntoConstrainTrySimplify({})

                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; whenTrue`);
                    const retTrue = mrNarrowTypes({
                        refTypesSymtab: rcond.inferRefRtnType.passing.symtab,
                        expr: whenTrue,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                        constraintItem: rcond.inferRefRtnType.passing.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(retTrue.byNode, byNodeSinglepath);

                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; whenFalse`);
                    const retFalse = mrNarrowTypes({
                        refTypesSymtab: rcond.inferRefRtnType.failing!.symtab,
                        expr: whenFalse,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                        constraintItem: rcond.inferRefRtnType.failing!.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(retFalse.byNode, byNodeSinglepath);

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
                    arrRefTypesTableReturn.push(retTrue.inferRefRtnType.passing);
                    arrRefTypesTableReturn.push(retFalse.inferRefRtnType.passing);
                    const retval: MrNarrowTypesInnerReturn = {
                        byNode: byNodeSinglepath,
                        arrRefTypesTableReturn
                    };
                    return retval;
                }
                break;
                /**
                 * PropertyAccessExpression
                 */
                // IWOZERE
                case SyntaxKind.PropertyAccessExpression:
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.PropertyAccessExpression`);
                    return mrNarrowTypesByPropertyAccessExpression({ refTypesSymtab: refTypesSymtabIn, expr, /* crit, */ qdotfallout, inferStatus, constraintItem: constraintItemIn });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(expr));
                    return mrNarrowTypesByCallExpression({ refTypesSymtab: refTypesSymtabIn, expr, /*crit, */ qdotfallout, inferStatus, constraintItem: constraintItemIn });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((expr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const ret = mrNarrowTypes({
                            refTypesSymtab: refTypesSymtabIn, expr:(expr as PrefixUnaryExpression).operand,
                            crit:{ negate: true, kind: InferCritKind.truthy, alsoFailing: true },
                            qdotfallout: undefined, inferStatus: { ...inferStatus, inCondition: true },
                            constraintItem: constraintItemIn
                        });
                        /**
                         * The crit was already set with negate: true to reverse the passing and failing.
                         * Below, the symbols are set to undefined, and the types converted to booleans.
                         */
                        const nodeTypes: Type[] = [];
                        //ret.inferRefRtnType.passing.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.passing.type)){
                            const ttype = checker.getTrueType();
                            nodeTypes.push(ttype);
                            ret.inferRefRtnType.passing.type = createRefTypesType(ttype);
                        }
                        //ret.inferRefRtnType.failing!.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.failing!.type)){
                            const ftype = checker.getFalseType();
                            nodeTypes.push(ftype);
                            ret.inferRefRtnType.failing!.type = createRefTypesType(ftype);
                        }
                        ret.byNode.set(expr, getUnionType(nodeTypes));
                        return {
                            byNode: ret.byNode,
                            arrRefTypesTableReturn: [ret.inferRefRtnType.passing, ret.inferRefRtnType.failing!]
                        };
                    }
                    Debug.assert(false);
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(expr));
                    Debug.assert(expr.initializer);
                    const initializer = expr.initializer;
                    const symbol = getSymbolOfNode(expr); // not condExpr.name
                    const isconstVar = isConstVariable(symbol);

                    const rhs = mrNarrowTypes({
                        refTypesSymtab: refTypesSymtabIn, expr:initializer, crit:{ kind: InferCritKind.none }, qdotfallout:undefined,
                        inferStatus: { ...inferStatus, inCondition: isconstVar },
                        constraintItem: constraintItemIn
                    });
                    Debug.assert(!rhs.inferRefRtnType.failing);
                    Debug.assert(rhs.inferRefRtnType.unmerged);
                    if (isIdentifier(expr.name)){
                        if (isconstVar){
                            const replayableItem: ReplayableItem = {
                                expr: expr.initializer,
                                symbol,
                                isconst: isconstVar,
                                nodeToTypeMap: new Map<Node,Type>(rhs.byNode)
                            };
                            inferStatus.replayables.set(symbol,replayableItem);
                            if (getMyDebug()){
                                const shdr = `mrNarrowTypes[dbg] case SyntaxKind.VariableDeclaration +replayable `;
                                consoleLog(shdr);
                                const as: string[]=[];
                                as.push(`symbol: ${dbgSymbolToStringSimple(replayableItem.symbol)}, isconst: ${replayableItem.isconst}`);
                                as.push(`expr: ${dbgNodeToString(replayableItem.expr)}`);
                                as.forEach(s=>consoleLog(`${shdr}: ${s}`));
                            };
                            const byNode = new Map<Node,Type>(rhs.byNode).set(expr,getTypeFromRefTypesType(rhs.inferRefRtnType.passing.type));
                            return {byNode, arrRefTypesTableReturn:[{
                                kind:RefTypesTableKind.return, type:rhs.inferRefRtnType.passing.type,
                                symtab: refTypesSymtabIn,
                                constraintItem: constraintItemIn
                            }]};
                        }
                        const arrRefTypesTableReturn: Readonly<RefTypesTableReturn[]> = inferStatus.inCondition ? rhs.inferRefRtnType.unmerged : [rhs.inferRefRtnType.passing];
                        {
                            /**
                             * Adding to the global declaredTypes here, but the property symbol wont be cleared when the property owner goes out of scope.
                             * TODO: To allow the memory to be reclaimed when it iws no longer needed, without explicit descoping,
                             * we could add a reference to the declared type directly in the RefTypesTableLeaf type, which would also make it easier to judge
                             * when a type is "always".
                             * TODO: In case of isconst===true, there is no point in widening.  However, in case of isconst===false, a variables allowed types is the widened type
                             *  >>>!!! unless otherwise declared to be a more narrowed type !!!!<<<.
                             */
                            const unwidenedTsType = getTypeFromRefTypesType(rhs.inferRefRtnType.passing.type);
                            if (isconstVar){
                                const unwidenedType = createRefTypesType(unwidenedTsType);
                                inferStatus.declaredTypes.set(symbol, createRefTypesTableLeaf(symbol,isconstVar,unwidenedType));
                            }
                            else {
                                const widenedType = createRefTypesType(checker.getWidenedType(unwidenedTsType));
                                inferStatus.declaredTypes.set(symbol, createRefTypesTableLeaf(symbol,isconstVar,widenedType));
                            }
                        }
                        const retval: MrNarrowTypesInnerReturn = {
                            arrRefTypesTableReturn,
                            assignmentData: {
                                symbol,
                                isconst: isconstVar,
                            },
                            byNode: rhs.byNode
                        };
                        return retval;
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail(`not yet implemented: `+Debug.formatSyntaxKind(expr.name.kind));
                    }
                }
                break;
                case SyntaxKind.BinaryExpression:{
                    return mrNarrowTypesByBinaryExpression({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr: expr as BinaryExpression, /*crit, */ qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TypeOfExpression:{
                    /**
                     * For a TypeOfExpression not as the child of a binary expressionwith ops  ===,!==,==,!=
                     */
                    return mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, constraintItem:constraintItemIn, expr: (expr as TypeOfExpression).expression, qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TrueKeyword:
                case SyntaxKind.FalseKeyword:
                case SyntaxKind.NumericLiteral:
                case SyntaxKind.StringLiteral:{
                    const type: Type = checker.getTypeAtLocation(expr);
                    return {
                        byNode: createNodeToTypeMap().set(expr, type),
                        arrRefTypesTableReturn: [{
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type: createRefTypesType(type),
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        }]
                    };
                }
                break;
                case SyntaxKind.ArrayLiteralExpression:{
                    // Calling getTypeAtLocation would result in an endless loop
                    // const type: Type = checker.getTypeAtLocation(expr);
                    /**
                     * The array itself is created above the mrNarrowTypes level, in "function checkArrayLiteral", checker.ts.
                     * So we don't set the byNode entry for expr.
                     * However, the variable types within the literal array must be set herein.
                     */
                    assertType<Readonly<ArrayLiteralExpression>>(expr);
                    const aret: RefTypesTableReturn[] = [];
                    let byNodeOut: NodeToTypeMap | undefined;
                    for (const e of expr.elements){
                        if (e.kind === SyntaxKind.SpreadElement) continue;
                        const {byNode, inferRefRtnType} = mrNarrowTypes({
                            refTypesSymtab: refTypesSymtabIn, expr:e,
                            crit:{ kind: InferCritKind.none },
                            qdotfallout: undefined, inferStatus,
                            constraintItem: constraintItemIn
                        });
                        if (!byNodeOut) byNodeOut = byNode;
                        else mergeIntoNodeToTypeMaps(byNode, byNodeOut);
                        aret.push({ ...inferRefRtnType.passing, symbol: undefined, isconst: undefined });
                    }
                    const rttrOut = mergeArrRefTypesTableReturnToRefTypesTableReturn({ arr:aret });
                    return {
                        byNode:byNodeOut??createNodeToTypeMap(),
                        arrRefTypesTableReturn: [rttrOut]
                    };
                }
                break;
                default: Debug.assert(false, "", ()=>`${Debug.formatSyntaxKind(expr.kind)}, ${dbgNodeToString(expr)}`);
            }
        }

        return mrNarrow;
    } // createMrNarrow




}
