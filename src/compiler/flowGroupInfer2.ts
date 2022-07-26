namespace ts {

    export function isRefTypesTableLeaf(x: RefTypesTable): x is RefTypesTableLeaf {
        return x.kind===RefTypesTableKind.leaf;
    }
    export function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn {
        return x.kind===RefTypesTableKind.return;
    }
    export function isRefTypesTableNonLeaf(x: RefTypesTable): x is RefTypesTableNonLeaf {
        return x.kind===RefTypesTableKind.nonLeaf;
    }


    export interface MrNarrow {
        mrNarrowTypes({ refTypesSymtab: refTypes, condExpr, crit, qdotfallout, inferStatus }: InferRefArgs): MrNarrowTypesReturn;
        createRefTypesSymtab(): RefTypesSymtab;
        dbgRefTypesTableToStrings(t: RefTypesTable): string[],
        dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[],
        mergeArrRefTypesTableReturnToRefTypesTableReturn(
            symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableReturn,
    };

    export function createMrNarrow(checker: TypeChecker, _mrState: MrState): MrNarrow {


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
            //dbgGetNodeText,
            //dbgFlowToString,
            //dbgFlowTypeToString,
            dbgNodeToString,
            dbgSignatureToString,
            dbgSymbolToStringSimple,
                //dbgWriteSignatureArray,
            //dbgFlowNodeGroupToString
            //dbgRefTypesRtnToStrings
        } = createDbgs(checker);

        function arrayFromSet<T>(set: Set<T>): T[] {
            // @ts-expect-error 2769
            return Array.from(set.keys()); //as Readonly<T[]>
        }

        // function typeToSet(type: Readonly<Type>): Set<Type> {
        //     const set = new Set<Type>();
        //     forEachTypeIfUnion(type, t=>{
        //         if (t!==neverType) set.add(t);
        //     });
        //     return set;
        // }

        // function setToType(set: Readonly<Set<Type>>): Type {
        //     // @ts-expect-error 2769
        //     return getUnionType(Array.from(set.keys()), UnionReduction.Literal);
        // }

        function createRefTypesType(type?: Readonly<Type>): RefTypesType {
            const _set = new Set<Type>();
            if (type===anyType) return { _flags: RefTypesTypeFlags.any, _set: undefined };
            else if (type===unknownType) return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
            else if (type===neverType || !type) return { _flags: RefTypesTypeFlags.none, _set };
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
        function intersectRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            const c = createRefTypesType() as RefTypesTypeNormal;
            if (isNeverType(a)||isNeverType(b)) return c;
            if (isAnyType(a)||isUnknownType(a)) return b;
            if (isAnyType(b)||isUnknownType(b)) return a;
            (a as RefTypesTypeNormal)._set.forEach(t=>{
                if ((b as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
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
        function isNeverType(type: RefTypesType): boolean {
            return type._flags===RefTypesTypeFlags.none && type._set.size===0;
        }
        function isAnyType(type: RefTypesType): boolean {
            return type._flags===RefTypesTypeFlags.any;
        }
        function isUnknownType(type: RefTypesType): boolean {
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
            if (a._flags !== b._flags) return false;
            else if (a._flags || b._flags || a._set.size !== b._set.size) return false;
            else return arrayFromSet(a._set).every(t=>b._set.has(t)) && arrayFromSet(b._set).every(t=>a._set.has(t));
        }


        function createRefTypesTableLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, type?: RefTypesType): RefTypesTableLeaf {
            return {
                kind:RefTypesTableKind.leaf,
                symbol, isconst, type: type ?? createRefTypesType()
            };
        }
        // function copyRefTypesTableLeaf(rtt: RefTypesTableLeaf): RefTypesTableLeaf {
        //     return {
        //         ...rtt,
        //         type: copyRefTypesType(rtt.type)
        //     };
        // }
        // // function createRefTypesTableReturn(symbol: Symbol | undefined , isconst: boolean | undefined, type: RefTypesType, symtab: RefTypesSymtab): RefTypesTableReturn {
        //     return {
        //         kind:RefTypesTableKind.return,
        //         symbol, isconst, type, symtab
        //     };
        // }
        function createRefTypesTableNonLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, preReqByTypeIn: [RefTypesType, RefTypesSymtab][] | ESMap<RefTypesType, RefTypesSymtab>
            ): MakeRequired<RefTypesTableNonLeaf, "preReqByType"> {
            const preReqByType = isArray(preReqByTypeIn) ? new Map<RefTypesType, RefTypesSymtab>(preReqByTypeIn) : (preReqByTypeIn instanceof Map) ? preReqByTypeIn : Debug.fail("preReqByTypeIn illegal type");
            return {
                kind: RefTypesTableKind.nonLeaf,
                symbol, isconst, preReqByType
            };
        }
        // function getRefTypesTypeFromRefTypesTable(t: Readonly<RefTypesTable>): RefTypesType {
        //     if (isRefTypesTableNonLeaf(t)){
        //         const type = createRefTypesType();
        //         t.preReqByType?.forEach((_,t)=>{
        //             mergeToRefTypesType({ source:t, target:type });
        //         });
        //         return type;
        //     }
        //     else return t.type;
        // }
        // function getTypeFromRefTypesTable(t: Readonly<RefTypesTable>): Type {
        //     return getTypeFromRefTypesType(getRefTypesTypeFromRefTypesTable(t));
        // }
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
        function mergeLeafIntoRefTypesSymtab({source,target}: { source: Readonly<RefTypesTableLeaf>, target: RefTypesSymtab }): void {
            if (!source.symbol) return;
            //const sourceSymbol = source.symbol!;
            const got = target.get(source.symbol);
            if (!got) target.set(source.symbol, { leaf: source });
            else {
                if (!(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst)){
                    Debug.assert(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst);
                }
                mergeToRefTypesType({ source: source.type, target: got.leaf.type });
            }
        }

        function mergeArrRefTypesTableReturnToRefTypesTableNonLeaf(symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableNonLeaf {
            const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = arr.map(t=>{
                return [t.type,t.symtab];
            });
            return createRefTypesTableNonLeaf(symbol, isconst, arrTypeSymtab);
        };
        function mergeArrRefTypesTableReturnToRefTypesTableReturn(symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableReturn {
            const x = mergeArrRefTypesTableReturnToRefTypesTableNonLeaf(symbol, isconst, arr);
            const { passing } = applyCritToRefTypesTable({
                refTypesTable: x,
                crit: { kind: InferCritKind.none }
            });
            return passing;
        };

        function dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string {
            return typeToString(getTypeFromRefTypesType(rt));
        }
        function dbgRefTypesTableToStrings(rtt: RefTypesTable): string[] {
            const as: string[]=["{"];
            as.push(`  kind: ${rtt.kind},`);
            as.push(`  symbol: ${dbgSymbolToStringSimple(rtt.symbol)},`);
            as.push(`  isconst: ${rtt.isconst},`);
            if (isRefTypesTableLeaf(rtt)||isRefTypesTableReturn(rtt)){
                as.push(`  type: ${dbgRefTypesTypeToString(rtt.type)},`);
            }
            if (isRefTypesTableNonLeaf(rtt)){
                as.push("  preReqByType: [");
                rtt.preReqByType?.forEach((symtab,type)=>{
                    as.push("    {");
                    as.push(`      type: ${dbgRefTypesTypeToString(type)}`);
                    dbgRefTypesSymtabToStrings(symtab).forEach((str,i)=>as.push((i===0)?"      symtab: ":"        "+str));
                    as.push("    },");
                });
            }
            if (isRefTypesTableReturn(rtt)){
                dbgRefTypesSymtabToStrings(rtt.symtab).forEach((str,i)=>as.push((i===0)?"  symtab: ":"  "+str));
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


        function applyCritToRefTypesTable({refTypesTable, crit}: {refTypesTable: RefTypesTableReturn | RefTypesTableNonLeaf, crit: InferCrit}): { passing: RefTypesTableReturn, failing?: RefTypesTableReturn | undefined } {
            if (refTypesTable.kind === RefTypesTableKind.return){
                const passingType = createRefTypesType();
                const failingType = createRefTypesType();
                applyCritToRefTypesType(refTypesTable.type, crit, (t: Type, bpass: boolean, bfail: boolean)=>{
                    if (bpass) addTypeToRefTypesType({ target:passingType,source:t });
                    if (crit.alsoFailing && bfail) addTypeToRefTypesType({ target: failingType, source: t });
                });
                let passingSymtab = refTypesTable.symtab;
                if (refTypesTable.symbol) {
                    /**
                     * could do some sanity checking here
                     */
                    // if (passingSymtab.has(refTypesTable.symbol)){
                    //     // sanity check that new value is a subset of old
                    // }
                    passingSymtab = copyRefTypesSymtab(refTypesTable.symtab);
                    passingSymtab.set(refTypesTable.symbol, { leaf:createRefTypesTableLeaf(refTypesTable.symbol, refTypesTable.isconst, passingType) });
                }
                const passing: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol: refTypesTable.symbol,
                        isconst: refTypesTable.isconst,
                        // @ts
                        type: passingType,
                        symtab: passingSymtab
                    };

                let failing: RefTypesTableReturn | undefined;
                if (crit.alsoFailing){
                    // @ ts-expect-error 2679
                    //const typeFailing = getUnionType(Array.from(failingType.keys()));
                    let failingSymtab = refTypesTable.symtab;
                    if (refTypesTable.symbol) {
                        /**
                         * could do some sanity checking here
                         */
                        // if (passingSymtab.has(refTypesTable.symbol)){
                        //     // sanity check that new value is a subset of old
                        // }
                        failingSymtab = copyRefTypesSymtab(refTypesTable.symtab);
                        failingSymtab.set(refTypesTable.symbol, { leaf:createRefTypesTableLeaf(refTypesTable.symbol, refTypesTable.isconst, failingType) });
                    }
                    failing = {
                        kind: RefTypesTableKind.return,
                        symbol: refTypesTable.symbol,
                        isconst: refTypesTable.isconst,
                        type: failingType,
                        symtab: failingSymtab
                    };
                }
                return { passing, failing };
            }
            else if (refTypesTable.kind === RefTypesTableKind.nonLeaf) {
                const mergeSymtabs = ({source,target}: { source: RefTypesSymtab, target: RefTypesSymtab }) => {
                    source.forEach((value,symbol)=>{
                        Debug.assert(symbol);
                        const got = target.get(symbol);
                        if (!got) target.set(symbol, value);
                        else {
                            Debug.assert(got.leaf.kind===RefTypesTableKind.leaf && value.leaf.kind===RefTypesTableKind.leaf);
                            Debug.assert(!!got.leaf.isconst===!!value.leaf.isconst);
                            mergeToRefTypesType({ source: (value.leaf as RefTypesTableLeaf).type, target: (got.leaf as RefTypesTableLeaf).type });
                        }
                    });
                };
                const passingType = createRefTypesType();
                const passingSymtab = createRefTypesSymtab();
                const failingType = createRefTypesType();
                const failingSymtab = createRefTypesSymtab();
                refTypesTable.preReqByType!.forEach((refTypesSymtab, refTypesType)=>{
                    applyCritToRefTypesType(refTypesType, crit, (t: Type, bpass: boolean, bfail: boolean)=>{
                        if (bpass) {
                            addTypeToRefTypesType({ target: passingType, source: t });
                            mergeSymtabs({ target: passingSymtab, source: refTypesSymtab });
                        }
                        if (crit.alsoFailing && bfail) {
                            addTypeToRefTypesType({ target: failingType, source: t });
                            mergeSymtabs({ target: failingSymtab, source: refTypesSymtab });
                        }
                    });
                });
                if (refTypesTable.symbol){
                    passingSymtab.set(refTypesTable.symbol, { leaf: createRefTypesTableLeaf(refTypesTable.symbol, refTypesTable.isconst, passingType) });
                    failingSymtab.set(refTypesTable.symbol, { leaf: createRefTypesTableLeaf(refTypesTable.symbol, refTypesTable.isconst, failingType) });
                }
                const passing: RefTypesTableReturn = {
                    kind: RefTypesTableKind.return,
                    symbol: refTypesTable.symbol,
                    isconst: refTypesTable.isconst,
                    type: passingType,
                    symtab: passingSymtab
                };
                if (!crit.alsoFailing) return { passing };
                else {
                    return {
                        passing,
                        failing: {
                            kind: RefTypesTableKind.return,
                            symbol: refTypesTable.symbol,
                            isconst: refTypesTable.isconst,
                            type: failingType,
                            symtab:failingSymtab
                        }
                    };
                }
            }
            else Debug.fail("unreachable");
        }


        function createNodeToTypeMap(): NodeToTypeMap {
            return new Map<Node,Type>();
        }
        function mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap){
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
            else {
                Debug.assert(false, "", ()=>crit.kind);
            }
        }


        /**
         *
         */
        // for reference:
        // function getTypeWithFacts(type: Type, include: TypeFacts) {
        //     return filterType(type, t => (getTypeFacts(t) & include) !== 0);
        // }


        // @ ts-expect-error
        // function setOfTypeToUnionType(s: Set<Type>): Type{
        //     // @ts-expect-error 2769
        //     return getUnionType(Array.from(s.keys()),UnionReduction.Literal);
        // }


        // @ ts-ignore-error 6133
        function mrNarrowTypesByCallExpression({refTypesSymtab:refTypesIn, condExpr:callExpr, /* crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {condExpr: CallExpression}): MrNarrowTypesInnerReturn {
            //return undefined as any as InferRefRtnType;
            Debug.assert(qdotfallout);
            // First duty is to call the precursors
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesIn, condExpr:callExpr, /*crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;
            const prePassingRefTypesType = prePassing.type;
            if (myDebug) {
                consoleLog("candidates by return of pre");
                forEachRefTypesTypeType(prePassingRefTypesType, t => consoleLog(typeToString(t)));
                consoleLog("end of candidates by return of pre");
            }
            /**
             * Collect all of the individual signatures from each candidate to create a single signature candidate set.
             */
            //let someSigLookupFailed = false;
            const allsigs: Signature[]=[];
            forEachRefTypesTypeType(prePassingRefTypesType, (t: Type) => {
                // ts.Type : getCallSignatures(): readonly Signature[];
                const sigs = checker.getSignaturesOfType(t, SignatureKind.Call);
                if (sigs.length===0){
                    //someSigLookupFailed = true;
                    //hadError = true;
                    // we can still carry on.
                    if (myDebug) consoleLog(`Error: ${typeToString(t)}, type mismatch, has no call signatures`);
                    // TODO: add error
                    return;
                }
                sigs.forEach(s=>allsigs.push(s));
            });
            /**
             * Perform the argument matching to each signature candidate as a separate virtual branch.
             *
             */
            type MatchedSig = & {
                pass: boolean;
                sig: Readonly<Signature>;
                //refTypesRtn?: RefTypesReturn; // only when pass is true
                signatureReturnType?: Type; // only when pass is true
                symtab?: RefTypesSymtab; // only when pass is true
                byNode?: ESMap<Node,Type>; // only when pass is true
            };
            const matchedSigs = allsigs.map((sig: Readonly<Signature>,_sigidx: number): MatchedSig => {
                let sargidx = -1;
                let sargRestElemType: Type | undefined;
                let sargRestSymbol: Symbol | undefined;
                //let rtsrtn: RefTypesTable = { rtnType:neverType, refTypes, symbolOfRtnType:undefined };
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
                let sigargsRefTypesSymtab = pre.passing.symtab;
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
                        condExpr: carg,
                        crit: {
                            kind: InferCritKind.assignable,
                            target: targetType,
                            // negate: false,
                            alsoFailing:true,
                        },
                        qdotfallout,
                        inferStatus
                    });
                    sigargsRefTypesSymtab = passing.symtab;
                    if (qdotfallout.length && !targetTypeIncludesUndefined){
                        consoleLog(
                            `Deferred Error: possible type of undefined/null can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    else if (failing && !isNeverType(failing.type)){
                        consoleLog(
                            `Deferred Error: possible type of ${
                                typeToString(getTypeFromRefTypesType(failing.type))
                            } can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    mergeIntoNodeToTypeMaps(byNode, cargsNodeToType);
                    return true;
                });
                if (!pass){
                    return { pass:false, sig };
                }
                else {
                    if (sig.resolvedReturnType) signatureReturnType = sig.resolvedReturnType;
                    else signatureReturnType = getReturnTypeOfSignature(sig); // TODO: this could be problematic
                    cargsNodeToType.set(callExpr, signatureReturnType);
                    return { pass:true, sig, signatureReturnType, symtab: sigargsRefTypesSymtab, byNode: cargsNodeToType };
                }
            });

            if (myDebug) {
                matchedSigs.forEach((ms,msidx)=>{
                    consoleGroup(`sig[${msidx}], pass:${ms.pass}, rtnType: ${ms.signatureReturnType ? typeToString(ms.signatureReturnType):"N/A"}}`);
                    consoleGroup(dbgSignatureToString(ms.sig));
                    if (ms.pass){
                        //dbgLogRefTypes();
                    }
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
                        symtab: ms.symtab!
                    });
                    mergeToRefTypesType({ source: type, target: totalType });
                    // mapTypeSymtab.set(createRefTypesType(ms.signatureReturnType), ms.symtab!);
                    mergeIntoNodeToTypeMaps(ms.byNode!, byNode);
                }
            });
            // const refTypesTable: RefTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, mapTypeSymtab);
            mergeIntoNodeToTypeMaps(pre.byNode, byNode);
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
            passing: RefTypesTableReturn,
            byNode: ESMap<Node, Type>
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
        function InferRefTypesPreAccess({refTypesSymtab: refTypes, condExpr, /*crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {condExpr: {expression: Expression}}): InferRefTypesPreAccessRtnType{
            const { inferRefRtnType:{ passing, failing }, byNode:byNodePre, saveByNodeForReplay: _saveByNodeForReplayPre } = mrNarrowTypes(
                { refTypesSymtab: refTypes, condExpr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout , inferStatus });
            Debug.assert(!_saveByNodeForReplayPre);
            Debug.assert(failing);
            //if (failing.rtnType!==neverType)
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
            //if (passing.rtnType === neverType)
            if (isNeverType(passing.type)){
                // createRefTypesTableNonLeaf(symbolOfRtnType, isconstRtnType, []);
                // const inferRefRtnType = applyCritToRefTypesTable({ refTypesTable:passing, crit });

                //const aRefTypesRtn: RefTypesRtn[] = [{ rtnType:neverType, refTypes:passing.refTypes, symbolOfRtnType }];
                return { kind:"immediateReturn", retval: { arrRefTypesTableReturn:[], byNode: byNodePre } };
            }
            return { kind:"normal", passing, byNode: byNodePre };
        }

        function mrNarrowTypesByPropertyAccessExpression({refTypesSymtab: refTypes, condExpr, /*crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (myDebug) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypesSymtab: refTypes, condExpr, /*crit,*/ qdotfallout, inferStatus });
            if (myDebug) {
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        function mrNarrowTypesByPropertyAccessExpression_aux({refTypesSymtab:refTypesSymtabIn, condExpr, /*crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
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
            //const condExprSymbol = getNodeLinks(condExpr).resolvedSymbol; // may or may not exist
            //if (myDebug && !condExprSymbol) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: condExpr: ${dbgNodeToString(condExpr)}, getNodeLinks(condExpr).resolvedSymbol is undefined`);
            Debug.assert(isPropertyAccessExpression(condExpr));
            Debug.assert(condExpr.expression);


            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesSymtabIn, condExpr, /* crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;

            /**
             * Use refTypes from pre.
             */
            const refTypesSymtab = prePassing.symtab;
            // Debug.assert(condExprSymbol);
            // Debug.assert(refTypes.bySymbol.has(condExprSymbol));
            // const condExprRefType = refTypes.bySymbol.get(condExprSymbol)!;


            /**
             * Each lookup should be treated as a separate virtual branch, with it's own RefTypesReturn, because the crit might distinguish between them.
             * We get by here with arrTypeSymtab, only because the symtab is added to directly: `refTypesSymtab.set(propSymbol, value); `
             *
             * In replayMode, we don't use the node type from byNode here for two reasons -
             * (1) The node type is already squashed so the infer info is lost
             * (2) We don't need it, because the types passed back from preAccess must be correct - identical to what is here (only squashed). Can be verified.
.             * */

            const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean, narrowable?: boolean}[]=[];
            const keystr = condExpr.name.escapedText as string;
            //const arrRttl: RefTypesTableReturn[] = []; //
            const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = []; //
            const arrRttr: RefTypesTableReturn[]=[];
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
                    arrTypeSymtab.push([createRefTypesType(undefinedType), refTypesSymtab]);
                    arrRttr.push({
                        kind: RefTypesTableKind.return,
                        symbol: undefined,
                        type,
                        symtab: refTypesSymtab
                    });
                    return;
                }
                if (isArrayOrTupleType(t)||t===stringType) {
                    if (keystr==="length") {
                        accessedTypes.push({ baseType: t, type:numberType, optional:false });
                        arrTypeSymtab.push([createRefTypesType(numberType), refTypesSymtab]);
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type: createRefTypesType(numberType),
                            symtab: refTypesSymtab
                        });
                    }
                    else {
                        accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                        arrTypeSymtab.push([createRefTypesType(undefinedType), refTypesSymtab]);
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type: createRefTypesType(undefinedType),
                            symtab: refTypesSymtab
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
                     * If narrowable the symbol should be in refTypes
                     */
                    //if (narrowable){
                        //symbolsOfRtnType.push(propSymbol);
                    //let symtab = refTypesSymtab;
                    let value = refTypesSymtab.get(propSymbol);
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
                        //symtab = copyRefTypesSymtab(refTypesSymtab);
                        //refTypesSymtab.set(propSymbol, value);
                    }
                    //}
                    arrTypeSymtab.push([resolvedType, refTypesSymtab]);
                    accessedTypes.push({ baseType: t, type: getTypeFromRefTypesType(resolvedType), declaredType, optional: optionalProp, readonlyProp, narrowable });
                    arrRttr.push({
                        kind: RefTypesTableKind.return,
                        symbol: propSymbol,
                        isconst: readonlyProp,
                        type: value.leaf.type,
                        symtab: refTypesSymtab
                    });
                return;
                }
                Debug.assert(false);
            });
            if (myDebug){
                consoleLog(`propertyTypes:`);
                accessedTypes.forEach(t=> {
                    consoleLog(`baseType:${typeToString(t.baseType)}, propType:${typeToString(t.type)}, optional:${t.optional}, lookupFail:${t.lookupFail}, readonlyProp: ${t.readonlyProp}, narrowable: ${t.narrowable} `);
                });
                consoleLog(`end propertyTypes:`);
            }
            if (myDebug && inferStatus.replayItemStack.length){
                // verify type is correct
                const checkType = createRefTypesType();
                arrRttr.forEach(x=>mergeToRefTypesType({ source:x.type, target:checkType }));
                //arrTypeSymtab.forEach(x=>mergeToRefTypesType({ source:x[0], target:checkType }));
                const recordedTsType = inferStatus.replayItemStack.slice(-1)[0].nodeToTypeMap.get(condExpr)!;
                Debug.assert(recordedTsType);
                const recordedType = createRefTypesType(recordedTsType);
                if (!equalRefTypesTypes(checkType, recordedType)){
                    equalRefTypesTypes(checkType, recordedType);
                    Debug.fail(`checkType:${dbgRefTypesTypeToString(checkType)} !== recordedType:${dbgRefTypesTypeToString(recordedType)}`);
                }
            }
            // const refTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, arrTypeSymtab);
            // if (myDebug){
            //     dbgRefTypesTableToStrings(refTypesTableNonLeaf).forEach(s=>consoleLog(s));
            // }
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
            pre.byNode.set(condExpr, getTypeFromRefTypesType(totalType));
            return { arrRefTypesTableReturn: arrRttr, byNode: pre.byNode };
        }

        type RefTypesTableReturnCritOut = Omit<RefTypesTableReturn,"symbol">;
        /**
         *
         * @param arrRttr
         * @param crit
         * @returns
         */
        const applyCritToArrRefTypesTableReturn = (arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>): {
            passing: RefTypesTableReturnCritOut, failing?: RefTypesTableReturnCritOut
        } =>{
            if (crit.kind===InferCritKind.none && arrRttr.length===1){
                return { passing: arrRttr[0] };
            }
            const totalSymtabPassing = createRefTypesSymtab();
            const totalTypePassing = createRefTypesType();
            const totalSymtabFailing = createRefTypesSymtab();
            const totalTypeFailing = createRefTypesType();
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
                if (!isNeverType(localTypePassing)){
                    localSymtabPassing = localSymtabPassing ? copyRefTypesSymtab(localSymtabPassing) : createRefTypesSymtab();
                    if (rttr.symbol){
                        mergeLeafIntoRefTypesSymtab({
                            source: {
                                kind: RefTypesTableKind.leaf,
                                symbol: rttr.symbol,
                                isconst: rttr.isconst,
                                type: localTypePassing,
                            },
                            target: localSymtabPassing
                        });
                    }
                    mergeToRefTypesType({ source: localTypePassing, target: totalTypePassing });
                    mergeIntoRefTypesSymtab({ source: localSymtabPassing, target: totalSymtabPassing });
                }
                if (!isNeverType(localTypeFailing)){
                    localSymtabFailing = localSymtabFailing ? copyRefTypesSymtab(localSymtabFailing) : createRefTypesSymtab();
                    if (rttr.symbol){
                        mergeLeafIntoRefTypesSymtab({
                            source: {
                                kind: RefTypesTableKind.leaf,
                                symbol: rttr.symbol,
                                isconst: rttr.isconst,
                                type: localTypeFailing,
                            },
                            target: localSymtabFailing
                        });
                    }
                    mergeToRefTypesType({ source: localTypeFailing, target: totalTypeFailing });
                    mergeIntoRefTypesSymtab({ source: localSymtabFailing, target: totalSymtabFailing });
                }
            });
            const passing: RefTypesTableReturnCritOut = {
                kind: RefTypesTableKind.return,
                //symbol: undefined,
                type: totalTypePassing,
                symtab: totalSymtabPassing
            };
            if (!crit.alsoFailing) return { passing };
            return {
                passing,
                failing: {
                    kind: RefTypesTableKind.return,
                    //symbol: undefined,
                    type: totalTypeFailing,
                    symtab: totalSymtabFailing
                }
            };
        };

        /**
         *
         * (1) Replay functionality
         *   If !!inferStatus.on, then perform replay iff expr is replayable - which is true when both following
         *     (a) expr is an identifier. property access, or a declaration, and therefore has a symbol
         *     (b) the symbol is in inferStatus.replayables, which is a map from symbols to node-to-type maps.
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypes({refTypesSymtab: refTypesSymtab, condExpr:expr, inferStatus, crit: critIn, qdotfallout: qdotfalloutIn}: InferRefArgs): MrNarrowTypesReturn {
            myDebug = getMyDebug();
            if (myDebug) {
                const inReplay = inferStatus.replayItemStack.length;
                const replayItem = inferStatus.replayItemStack.length ? inferStatus.replayItemStack.slice(-1)[0] : undefined;
                    consoleGroup(`mrNarrowTypes[in] condExpr:${dbgNodeToString(expr)}, crit.kind: ${critIn.kind}, crit.negate: ${critIn.negate}, crit.alsoFailing ${
                    critIn.alsoFailing
                }, inferStatus.replayItemStack.length: ${!inferStatus.replayItemStack.length}, inferStatus.inCondition: ${inferStatus.inCondition}`);
                if (inReplay) {
                    consoleGroup(`mrNarrowTypes[in] replayData: {symbol: ${replayItem?.symbol}, isconst: ${replayItem?.isconst}, expr: ${replayItem?.expr}}`);
                    consoleLog("mrNarrowTypes[in] replayData.byNode:");
                    replayItem?.nodeToTypeMap.forEach((t,n)=>{
                        consoleLog(`mrNarrowTypes[in]    node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                    });
                    consoleGroupEnd();
                }
                consoleLog(`mrNarrowTypes[in] qdotfalloutIn: ${!qdotfalloutIn ? "<undef>" : `length: ${qdotfalloutIn.length}`}`);
                consoleLog(`mrNarrowTypes[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtab).forEach(str=> `  ${str}`);
            }
            const savedInCondition = inferStatus.inCondition ;
            const inCondition = inferStatus.inCondition || critIn.kind!==InferCritKind.none;
            if (inCondition && !inferStatus.inCondition) inferStatus.inCondition = true;
            /**
             * Judge whether expr refers to a replayable
             */
            let newReplayItem: ReplayableItem | undefined;
            if (isIdentifier(expr) && inferStatus.inCondition){
                const symbol = getResolvedSymbol(expr);
                const got = inferStatus.replayables.get(symbol);
                if (got) {
                    /**
                     * Replace the replay data
                     */
                    newReplayItem = got;
                    inferStatus.replayItemStack.push(got);
                    if (myDebug){
                        consoleLog("new replayable detected");
                        consoleGroup(`mrNarrowTypes[dbg] newReplayItem: {symbol: ${newReplayItem?.symbol}, isconst: ${newReplayItem?.isconst}, expr: ${newReplayItem?.expr}}`);
                        consoleLog("mrNarrowTypes[dbg] newReplayItem.byNode:");
                        newReplayItem?.nodeToTypeMap.forEach((t,n)=>{
                            consoleLog(`mrNarrowTypes[dbg]    node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                        });
                        consoleGroupEnd();
                        }
                }
                else {
                    if (myDebug) consoleLog("new replayable NOT detected");
                }
            }

            const qdotfallout = qdotfalloutIn??([] as RefTypesTableReturn[]);
            const replaySymtab = newReplayItem ? createRefTypesSymtab() : undefined;
            // const replayQotfallout = newReplayItem ? [] : qdotfallout;
            if (myDebug){
                consoleGroup("mrNarrowTypes_inner[in]");
            }

            const innerret = mrNarrowTypes_inner({ refTypesSymtab: replaySymtab??refTypesSymtab, condExpr: newReplayItem?.expr?? expr, qdotfallout,
                inferStatus });

            if (newReplayItem) inferStatus.replayItemStack.pop();
            inferStatus.inCondition = savedInCondition;

            if (myDebug){
                innerret.arrRefTypesTableReturn.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`  innerret.arttr[${i}]: ${str}`);
                    });
                });
                innerret.byNode.forEach((type,node)=>{
                    consoleLog(`  innerret.byNode: { node: ${dbgNodeToString(node)}, type: ${typeToString(type)}`);
                });
                if (innerret.assignmentData){
                    consoleLog(` innerret.assignmentData, { symbol: ${
                        dbgSymbolToStringSimple(innerret.assignmentData?.symbol)
                    }, isconst: ${
                        innerret.assignmentData?.isconst
                    }`);
                }
                consoleLog("mrNarrowTypes_inner[out]");
                consoleGroupEnd();
            }

            let finalArrRefTypesTableReturn = innerret.arrRefTypesTableReturn;
            if (myDebug){
                consoleLog(`qdotfallout.length: ${qdotfallout.length}`);
                qdotfallout.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`  qdotfallout[${i}]: ${str}`);
                    });
                });
           }
            if (!qdotfalloutIn){
                /**
                 * !qdotfallout so merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit
                 */
                if (myDebug){
                    consoleLog("Merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit");
                    qdotfallout.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(str=>{
                            consoleLog(`  qdotfallout[${i}]: ${str}`);
                        });
                    });
                }
                finalArrRefTypesTableReturn = [...qdotfallout, ...innerret.arrRefTypesTableReturn];
            }
            /**
             * Apply the crit before handling the replayResult (if any)
             */
            const crit = { ...critIn };
            if (innerret.negateCrit){
                crit.negate = !critIn.negate; // corresponds to preceding unary !
            }
            const critret = applyCritToArrRefTypesTableReturn(finalArrRefTypesTableReturn, crit);
            if (myDebug){
                consoleLog("mrNarrowTypes[dbg], applyCritToArrRefTypesTableReturn return passing:");
                dbgRefTypesTableToStrings(critret.passing as RefTypesTableReturn).forEach(str=>{
                    consoleLog(`  ${str}`);
                });
                if (critret.failing){
                    consoleLog("mrNarrowTypes[dbg], applyCritToArrRefTypesTableReturn return failing:");
                    dbgRefTypesTableToStrings(critret.failing as RefTypesTableReturn).forEach(str=>{
                        consoleLog(`  ${str}`);
                    });
                }
            }
            let finalRetval: MrNarrowTypesReturn;
            if (newReplayItem) {
                //Debug.assert(innerret.assignmentData && innerret.assignmentData.symbol===replaySymbol);
                Debug.assert(critIn.kind!==InferCritKind.none);
                /**
                 * The actual return symbol must be replaySymbol, and that must also be added to symtabs.
                 * (1) The return byNode is the lhs node, not the rhs initializer used for replay.  Taken from the input refTypesSymtab.
                 * (2) The replay passing/failing? symtab member results corespond to the symbol states at the point of declaration, then narrowed.
                 *     But the actual symbols states may differ because in the interum between the declaration and the replay -
                 *     (a) They are !isconst symbols which have been redefined or widened by branches joining
                 *     (b) They are any symbol which have been narrowed, but not affected by (a). (!!isconst symbols cant be assigned)
                 *     Re: (a), for the time being don't pass the types of !isconst symbols as replay output.  As a future improvement, symbol updates could be marked with an incremented sequence number,
                 *     to test for validity.
                 *     Re: (b), the types are narrowed by intersection with the input refTypesSymtab
                 * (3) passing.type and failing.type are also intersected with input type from input refTypesSymtab corresponding to replaySymbol,
                 *     and their symbol is set to replaySymbol
                 */
                const nodeleaf = refTypesSymtab.get(newReplayItem.symbol)?.leaf;
                if (!nodeleaf){
                    Debug.assert(nodeleaf);
                }
                else {
                    if (myDebug){
                        consoleLog(`refTypesSymtab.get(newReplayItem.symbol)?.leaf.type : ${typeToString(getTypeFromRefTypesType(nodeleaf.type))}`);
                    }
                }
                let returnByNode: NodeToTypeMap;
                let passingSymtab: RefTypesSymtab;
                let failingSymtab: RefTypesSymtab | undefined;
                let passingType: RefTypesType;
                let failingType: RefTypesType | undefined;
                {
                    // (1)
                    returnByNode = new Map<Node, Type>([[ expr, getTypeFromRefTypesType(nodeleaf.type) ]]);
                }
                {
                    // (2)
                    passingSymtab = copyRefTypesSymtab(critret.passing.symtab);
                    critret.passing.symtab.forEach((rttl,_symbol)=>{
                        if (!rttl.leaf.isconst) return;
                        const got = passingSymtab.get(_symbol);//?.leaf.type;
                        Debug.assert(got);
                        got.leaf.type = intersectRefTypesTypes(rttl.leaf.type, got.leaf.type);
                    });
                    if (critret.failing){
                        failingSymtab = copyRefTypesSymtab(critret.failing.symtab);
                        critret.failing.symtab.forEach((rttl,_symbol)=>{
                            if (!rttl.leaf.isconst) return;
                            const got = failingSymtab!.get(_symbol);//?.leaf.type;
                            Debug.assert(got);
                            got.leaf.type = intersectRefTypesTypes(rttl.leaf.type, got.leaf.type);
                        });
                    }
                }
                {
                    // (3)
                    passingType = intersectRefTypesTypes(critret.passing.type, nodeleaf.type);
                    passingSymtab.set(newReplayItem.symbol, { leaf: createRefTypesTableLeaf(newReplayItem.symbol, newReplayItem.isconst, passingType) });
                    if (critret.failing) {
                        failingType = intersectRefTypesTypes(critret.failing.type, nodeleaf.type);
                        failingSymtab!.set(newReplayItem.symbol, { leaf: createRefTypesTableLeaf(newReplayItem.symbol, newReplayItem.isconst, failingType) });
                    }
                }
                const inferRefRtnType: InferRefRtnType = {
                    passing: {
                        kind: RefTypesTableKind.return,
                        symbol: newReplayItem.symbol,
                        isconst: newReplayItem.isconst,
                        type: passingType,
                        symtab: passingSymtab
                    }
                };
                if (critret.failing){
                    inferRefRtnType.failing = {
                        kind: RefTypesTableKind.return,
                        symbol: newReplayItem.symbol,
                        isconst: newReplayItem.isconst,
                        type: failingType!,
                        symtab: failingSymtab!
                    };
                }
                finalRetval = {
                    byNode: returnByNode,
                    inferRefRtnType
                };
            } // if replaySymbol
            else {
                if (innerret.assignmentData?.symbol){
                    critret.passing.symtab.set(innerret.assignmentData.symbol,{ leaf: {
                        kind: RefTypesTableKind.leaf,
                        symbol: innerret.assignmentData.symbol,
                        isconst: innerret.assignmentData.isconst,
                        type: critret.passing.type,
                    }});
                }
                const inferRefRtnType: InferRefRtnType = {
                    passing: {
                        kind: RefTypesTableKind.return,
                        symbol: innerret.assignmentData?.symbol,
                        isconst: innerret.assignmentData?.isconst,
                        type: critret.passing.type,
                        symtab: critret.passing.symtab
                    }
                };
                if (critret.failing){
                    if (innerret.assignmentData?.symbol){
                        critret.failing.symtab.set(innerret.assignmentData.symbol,{ leaf: {
                            kind: RefTypesTableKind.leaf,
                            symbol: innerret.assignmentData.symbol,
                            isconst: innerret.assignmentData.isconst,
                            type: critret.failing.type,
                        }});
                    }
                    inferRefRtnType.failing = {
                        kind: RefTypesTableKind.return,
                        symbol: innerret.assignmentData?.symbol,
                        isconst: innerret.assignmentData?.isconst,
                        type: critret.failing.type,
                        symtab: critret.failing.symtab
                    };
                }
                finalRetval = {
                    byNode: innerret.byNode,
                    inferRefRtnType,
                };
            }


            const {inferRefRtnType:r, byNode} = finalRetval;
            if (myDebug) {
                consoleLog(`mrNarrowTypes[out] condExpr:${dbgNodeToString(expr)}, crit.kind: ${crit.kind} } -> { passing: ${
                    dbgRefTypesTypeToString(r.passing.type)
                }, failing: ${
                    r.failing ? dbgRefTypesTypeToString(r.failing.type) : ""
                }}`);
                consoleLog("passing:");
                dbgRefTypesTableToStrings(r.passing).forEach(s=>consoleLog("  "+s));
                if (r.failing) {
                    consoleLog("failing:");
                    dbgRefTypesTableToStrings(r.failing).forEach(s=>consoleLog("  "+s));
                    }
                consoleGroup("mrNarrowTypes[out] byNode:");
                byNode.forEach((t,n)=>{
                    consoleLog(`mrNarrowTypes[out]    node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                });
                consoleGroupEnd();
                consoleGroupEnd();
            }
            return finalRetval;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypes_inner({refTypesSymtab: refTypesSymtabIn, condExpr, qdotfallout, inferStatus}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            switch (condExpr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    //let refTypesSymtab = refTypesSymtabIn;
                    if (myDebug) consoleLog(`case SyntaxKind.Identifier`);
                    Debug.assert(isIdentifier(condExpr));
                    const condSymbol = getResolvedSymbol(condExpr); // getSymbolOfNode()?
                    const isconst = isConstantReference(condExpr);
                    let type: RefTypesType | undefined;
                    let tstype: Type | undefined;
                    if (inferStatus.replayItemStack.length){
                        tstype = inferStatus.replayItemStack.slice(-1)[0].nodeToTypeMap.get(condExpr);
                        if (!tstype){
                            Debug.assert(tstype);
                        }
                        type = createRefTypesType(tstype);
                    }
                    else type = refTypesSymtabIn.get(condSymbol)?.leaf.type;
                    if (!type){
                        const tstype = getTypeOfSymbol(condSymbol);
                        if (tstype===errorType){
                            Debug.assert(false);
                        }
                        type = createRefTypesType(tstype);
                    }
                    if (!tstype) tstype = getTypeFromRefTypesType(type);
                    const byNode = createNodeToTypeMap();
                    byNode.set(condExpr, tstype);
                    const rttr: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol: condSymbol,
                        isconst,
                        type,
                        symtab: refTypesSymtabIn
                    };
                    const mrNarrowTypesInnerReturn: MrNarrowTypesInnerReturn = {
                        byNode,
                        arrRefTypesTableReturn: [rttr],
                        assignmentData: {
                            isconst,
                            symbol: condSymbol
                        }
                    };
                    return mrNarrowTypesInnerReturn;

                }
                /**
                 * NonNullExpression
                 */
                case SyntaxKind.NonNullExpression: {
                    Debug.assert(isNonNullExpression(condExpr));
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
                     const innerret = mrNarrowTypes_inner({refTypesSymtab: refTypesSymtabIn, condExpr: condExpr.expression,
                        //crit: {kind: InferCritKind.twocrit, crits:[{ kind:InferCritKind.notnullundef }, crit]},
                        qdotfallout, inferStatus });

                    /**
                     * Apply notnullundef criteria without squashing the result into passing/failing
                     * Note that innerret.byNode is not altered, under the assumption that byNode does not yet include the types to be discriminated.
                     */
                    const applyNotNullUndefCritToRefTypesTableReturn = (arrRttr: RefTypesTableReturn[]): RefTypesTableReturn[] => {
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
                        arrRefTypesTableReturn: applyNotNullUndefCritToRefTypesTableReturn(innerret.arrRefTypesTableReturn)
                    };
                }
                /**
                 * PropertyAccessExpression
                 */
                case SyntaxKind.PropertyAccessExpression:
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.PropertyAccessExpression`);
                    return mrNarrowTypesByPropertyAccessExpression({ refTypesSymtab: refTypesSymtabIn, condExpr, /* crit, */ qdotfallout, inferStatus });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(condExpr));
                    return mrNarrowTypesByCallExpression({ refTypesSymtab: refTypesSymtabIn, condExpr, /*crit, */ qdotfallout, inferStatus });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((condExpr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        //const negCrit: InferCrit = { ...crit, negate:!crit.negate } as InferCrit;
                        const innerret = mrNarrowTypes_inner({ refTypesSymtab: refTypesSymtabIn, condExpr:(condExpr as PrefixUnaryExpression).operand, /* crit:negCrit, */ qdotfallout, inferStatus });
                        return {
                            ...innerret,
                            negateCrit: true
                        };
                    }
                    Debug.assert(false);
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(condExpr));
                    Debug.assert(condExpr.initializer);
                    const initializer = condExpr.initializer;
                    const rhs = mrNarrowTypes_inner({ refTypesSymtab: refTypesSymtabIn, condExpr:initializer, /* crit:{ kind: InferCritKind.none }, */ qdotfallout, inferStatus });
                    if (isIdentifier(condExpr.name)){
                        /**
                         * More processing and error checking of the lhs is taking place higher up in checkVariableLikeDeclaration.
                         *
                         * Setting "saveByNodeForReplay" makes this symbol a replayable.
                         * Currently only "isconst" symbols are set.
                         * Note: the rhs is not required to be all const. If at least one const is on the rhs, replay is meaningful.
                         * However, pure const only rhs could be a condition.
                         */
                        const symbol = getSymbolOfNode(condExpr); // not condExpr.name
                        const isconstVar = isConstVariable(symbol);
                        const saveByNodeForReplay = isconstVar; // isConstVariable(symbol) && isConstantReference(initializer);
                        if (saveByNodeForReplay){
                            inferStatus.replayables.set(symbol,{
                                expr: initializer,
                                isconst: isconstVar,
                                symbol,
                                nodeToTypeMap: rhs.byNode
                            });
                            if (myDebug){
                                consoleLog(`mrNarrowTypes_inner: replayable added: { symbol:${dbgSymbolToStringSimple(symbol)}, isconst:${isconstVar}, expr: ${dbgNodeToString(initializer)}}`);
                            }
                        }
                        const retval: MrNarrowTypesInnerReturn = {
                            ... rhs,
                            assignmentData: {
                                symbol,
                                isconst: isconstVar,
                            }
                        };
                        return retval;
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail(`not yet implemented: `+Debug.formatSyntaxKind(condExpr.name.kind));
                    }
                }
                break;
                default: Debug.assert(false, "", ()=>`${Debug.formatSyntaxKind(condExpr.kind)}, ${dbgNodeToString(condExpr)}`);
            }
        }

        return {
            mrNarrowTypes,
            createRefTypesSymtab,
            dbgRefTypesTableToStrings,
            dbgRefTypesSymtabToStrings,
            mergeArrRefTypesTableReturnToRefTypesTableReturn,
        };

    } // createMrNarrow

}
