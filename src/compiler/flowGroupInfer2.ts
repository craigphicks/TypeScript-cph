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
        mrNarrowTypes({ refTypesSymtab: refTypes, condExpr, crit, qdotfallout }: InferRefArgs): MrNarrowTypesReturn;
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
        const errorType = checker.getErrorType();
        const nullType = checker.getNullType();
        // @ts-expect-error
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

        function arrayFromSet<T>(set: Set<T>): Readonly<T[]> {
            // @ts-expect-error 2769
            return Array.from(set.keys()); //as Readonly<T[]>
        }

        function typeToSet(type: Readonly<Type>): Set<Type> {
            const set = new Set<Type>();
            forEachTypeIfUnion(type, t=>set.add(t));
            return set;
        }

        function setToType(set: Readonly<Set<Type>>): Type {
            // @ts-expect-error 2769
            return getUnionType(Array.from(set.keys()), UnionReduction.Literal);
        }

        function createRefTypesType(t: Readonly<Type> = checker.getNeverType()): RefTypesType {
            return {
                _set: typeToSet(t)
            };
        }
        function addTypeToRefTypesType({source:t,target:rt}: { source: Readonly<Type>, target: RefTypesType}): void {
            if (!(t.flags & TypeFlags.Union)) rt._set.add(t);
            else {
                forEachTypeIfUnion(t, tt=> rt._set.add(tt));
            }
        }
        function mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void {
            source._set.forEach(t=>target._set.add(t));
        }
        function copyRefTypesType(rt: Readonly<RefTypesType>): RefTypesType {
            return { _set: new Set(rt._set) };
        }
        function getTypeFromRefTypesType(rt: Readonly<RefTypesType>): Type {
            return setToType(rt._set) ;
        }
        function isNeverType(type: RefTypesType): boolean {
            return type._set.size===0 || type._set.size===1 && arrayFromSet(type._set)[0]===neverType;
        }
        function forEachRefTypesTypeType<F extends (t: Type) => any>(r: Readonly<RefTypesType>, f: F): void {
            if (r._set.size===0) f(neverType);
            else r._set.forEach(t=>f(t));
        }

        function createRefTypesTableLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, type?: RefTypesType): RefTypesTableLeaf {
            return {
                kind:RefTypesTableKind.leaf,
                symbol, isconst, type: type ?? createRefTypesType()
            };
        }
        // @ts-expect-error
        function copyRefTypesTableLeaf(rtt: RefTypesTableLeaf): RefTypesTableLeaf {
            return {
                ...rtt,
                type: copyRefTypesType(rtt.type)
            };
        }
        function createRefTypesTableReturn(symbol: Symbol | undefined , isconst: boolean | undefined, type: RefTypesType, symtab: RefTypesSymtab): RefTypesTableReturn {
            return {
                kind:RefTypesTableKind.return,
                symbol, isconst, type, symtab
            };
        }
        function createRefTypesTableNonLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, preReqByTypeIn: [RefTypesType, RefTypesSymtab][] | ESMap<RefTypesType, RefTypesSymtab>): RefTypesTableNonLeaf {
            const preReqByType = isArray(preReqByTypeIn) ? new Map<RefTypesType, RefTypesSymtab>(preReqByTypeIn) : (preReqByTypeIn instanceof Map) ? preReqByTypeIn : Debug.fail("preReqByTypeIn illegal type");
            return {
                kind: RefTypesTableKind.nonLeaf,
                symbol, isconst, preReqByType
            };
        }
        function getRefTypesTypeFromRefTypesTable(t: Readonly<RefTypesTable>): RefTypesType {
            if (isRefTypesTableNonLeaf(t)){
                const type = createRefTypesType();
                t.preReqByType?.forEach((_,t)=>{
                    mergeToRefTypesType({ source:t, target:type });
                });
                return type;
            }
            else return t.type;
        }
        function getTypeFromRefTypesTable(t: Readonly<RefTypesTable>): Type {
            return getTypeFromRefTypesType(getRefTypesTypeFromRefTypesTable(t));
        }
        function createRefTypesSymtab(): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>();
        }
        function copySymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>(symtab);
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
            return typeToString(setToType(rt._set));
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
                    passingSymtab = copySymtab(refTypesTable.symtab);
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
                        failingSymtab = copySymtab(refTypesTable.symtab);
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
        // @ts-ignore-error 6133
        function applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType,crit: InferCrit, func: F): void {
            if (crit.kind===InferCritKind.none) {
                rt._set.forEach(t => {
                    func(t, /* pass */ true, /* fail */ false);
                });
            }
            else if (crit.kind===InferCritKind.truthy) {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
                rt._set.forEach(t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.notnullundef) {
                const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
                const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
                rt._set.forEach(t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.assignable) {
                rt._set.forEach(source => {
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


        // @ts-expect-error
        function setOfTypeToUnionType(s: Set<Type>): Type{
            // @ts-expect-error 2769
            return getUnionType(Array.from(s.keys()),UnionReduction.Literal);
        }


        // @ ts-ignore-error 6133
        function mrNarrowTypesByCallExpression({refTypesSymtab:refTypesIn, condExpr:callExpr, crit, qdotfallout, doReplayMode}: InferRefArgs & {condExpr: CallExpression}): MrNarrowTypesReturn {
            //return undefined as any as InferRefRtnType;
            Debug.assert(qdotfallout);
            // First duty is to call the precursors
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesIn, condExpr:callExpr, crit, qdotfallout, doReplayMode }, /* symbolOfRtnType */ undefined, /* isconstOfRtnType */ undefined);
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
                        doReplayMode
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
            const mapTypeSymtab = new Map<RefTypesType,RefTypesSymtab>();
            matchedSigs.forEach(ms=>{
                if (ms.pass) {
                    mapTypeSymtab.set(createRefTypesType(ms.signatureReturnType), ms.symtab!);
                    mergeIntoNodeToTypeMaps(ms.byNode!, byNode);
                }
            });
            const refTypesTable: RefTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, mapTypeSymtab);
            mergeIntoNodeToTypeMaps(pre.byNode, byNode);

            // /**
            //  * TODO:
            //  * Do something so the queries on CallExpression yield only the passed signatures as valid candidates.
            //  * In no signatures are valid it is an error.
            //  */
            /**
             * Note: if there were no passed signatures then 'never' return type will (should) occur with no extra work.
             */
            return { inferRefRtnType: applyCritToRefTypesTable({ refTypesTable, crit }), byNode };
        }

        type InferRefTypesPreAccessRtnType = & {
            kind: "immediateReturn",
            retval: MrNarrowTypesReturn
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
         * If undefined is the only branch then {kind:"immediateReturn", retval} is returned, with an appropriate crit filtered value for retval.
         * Otherwise {kind:"immediateReturn", passing} is returned, where `passing` is the predecessor passing branch.
         * @param param0
         * @param symbolOfRtnType
         * @returns
         */
        function InferRefTypesPreAccess({refTypesSymtab: refTypes, condExpr, crit, qdotfallout, doReplayMode}: InferRefArgs & {condExpr: {expression: Expression}}, symbolOfRtnType?: Symbol , isconstRtnType?: boolean): InferRefTypesPreAccessRtnType{
            const { inferRefRtnType:{ passing, failing }, byNode:byNodePre } = mrNarrowTypes(
                { refTypesSymtab: refTypes, condExpr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout , doReplayMode });
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
                createRefTypesTableNonLeaf(symbolOfRtnType, isconstRtnType, []);
                const inferRefRtnType = applyCritToRefTypesTable({ refTypesTable:passing, crit });

                //const aRefTypesRtn: RefTypesRtn[] = [{ rtnType:neverType, refTypes:passing.refTypes, symbolOfRtnType }];
                return { kind:"immediateReturn", retval: { inferRefRtnType, byNode: byNodePre } };
            }
            return { kind:"normal", passing, byNode: byNodePre };
        }

        function mrNarrowTypesByPropertyAccessExpression({refTypesSymtab: refTypes, condExpr, crit, qdotfallout, doReplayMode}: InferRefArgs): MrNarrowTypesReturn {
            if (myDebug) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypesSymtab: refTypes, condExpr, crit, qdotfallout, doReplayMode });
            if (myDebug) {
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        function mrNarrowTypesByPropertyAccessExpression_aux({refTypesSymtab:refTypesSymtabIn, condExpr, crit, qdotfallout, doReplayMode}: InferRefArgs): MrNarrowTypesReturn {
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


            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesSymtabIn, condExpr, crit, qdotfallout, doReplayMode }, /* symbolOfRtnType */ undefined);
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;

            /**
             * Use refTypes from pre.
             */
            const refTypesSymtab = prePassing.symtab;
            // Debug.assert(condExprSymbol);
            // Debug.assert(refTypes.bySymbol.has(condExprSymbol));
            // const condExprRefType = refTypes.bySymbol.get(condExprSymbol)!;


            // Each lookup is a searate virtual branch, so requires its own refTypesRtn.

            //const aRefTypesRtn: RefTypesRtn[]=[];

            // TODO??: Improve this section by using the function defined under "interface Type " in types.ts
            //const symbolsOfRtnType: Symbol[]=[];
            //const propRefTypes = createRefTypes();
            const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean, narrowable?: boolean}[]=[];
            const keystr = condExpr.name.escapedText as string;
            //const arrRttl: RefTypesTableReturn[] = [];
            const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = [];
            forEachRefTypesTypeType(prePassing.type, t => {
                if (t===undefinedType||t===nullType) {
                    Debug.assert(false);
                }
                if (!(t.flags & TypeFlags.Object)){
                    accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                    arrTypeSymtab.push([createRefTypesType(undefinedType), refTypesSymtab]);
                    return;
                }
                if (isArrayOrTupleType(t)) {
                    if (keystr==="length") {
                        accessedTypes.push({ baseType: t, type:numberType, optional:false });
                        arrTypeSymtab.push([createRefTypesType(numberType), refTypesSymtab]);
                    }
                    else {
                        accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                        arrTypeSymtab.push([createRefTypesType(undefinedType), refTypesSymtab]);
                    };
                    return;
                }
                /**
                 * propSymbols must be added to refTypes if not already there, and we also need to keep track of all looked-up symbols because they will be all be
                 * in symbolsOfRtnType
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
                    let symtab = refTypesSymtab;
                    let value = refTypesSymtab.get(propSymbol);
                    if (value){
                        resolvedType = value.leaf.type;
                        Debug.assert(value.leaf.isconst===readonlyProp);
                    }
                    else {
                        consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: adding new symbol to ref types, {symbol:<${
                            propSymbol.escapedName},${getSymbolId(propSymbol)}>, type ${typeToString(declaredType)}, const:${readonlyProp}`);
                        value = { leaf: { kind: RefTypesTableKind.leaf, symbol: propSymbol, isconst:readonlyProp, type: resolvedType } };
                        refTypesSymtab.set(propSymbol, value);
                    }
                    //}
                    symtab = copySymtab(refTypesSymtab);
                    arrTypeSymtab.push([resolvedType, symtab]);
                    accessedTypes.push({ baseType: t, type: getTypeFromRefTypesType(resolvedType), declaredType, optional: optionalProp, readonlyProp, narrowable });
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
            const refTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, arrTypeSymtab);
            if (myDebug){
                dbgRefTypesTableToStrings(refTypesTableNonLeaf).forEach(s=>consoleLog(s));
            }
            const hasFailedLookup = accessedTypes.some(x=>x.lookupFail);
            const hasSuccessLookup = accessedTypes.some(x=>!x.lookupFail);
            let requirePropertyDefinedForEachSubtype = false;
            requirePropertyDefinedForEachSubtype = false;
            if (requirePropertyDefinedForEachSubtype && hasFailedLookup){
                // TODO: output error
            }
            else if (!hasSuccessLookup){
                // TODO: output error
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: no lookups were successful`);
            }
            const byNode = createNodeToTypeMap();
            mergeIntoNodeToTypeMaps(pre.byNode, byNode);
            byNode.set(condExpr, getTypeFromRefTypesTable(refTypesTableNonLeaf));
            return { inferRefRtnType: applyCritToRefTypesTable({ refTypesTable: refTypesTableNonLeaf, crit }), byNode };
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypes({refTypesSymtab: refTypes, condExpr, crit, qdotfallout, doReplayMode}: InferRefArgs): MrNarrowTypesReturn {
            myDebug = getMyDebug();
            if (myDebug) {
                consoleGroup(`mrNarrowTypes[in] condExpr:${dbgNodeToString(condExpr)}, crit.kind: ${crit.kind}, crit.negate: ${crit.negate}, crit.alsoFailing ${crit.alsoFailing}`);
            }
            const retval = mrNarrowTypes_aux({ refTypesSymtab: refTypes, condExpr, crit, qdotfallout, doReplayMode });
            const {inferRefRtnType:r, byNode} = retval;
            if (myDebug) {
                consoleLog(`mrNarrowTypes[out] condExpr:${dbgNodeToString(condExpr)}, crit.kind: ${crit.kind}, doReplayMode: ${doReplayMode} -> { passing: ${
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
            return retval;
        }

        function mrNarrowTypes_aux({refTypesSymtab: refTypesSymtabIn, condExpr, crit, qdotfallout, doReplayMode}: InferRefArgs): MrNarrowTypesReturn {
            switch (condExpr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    if (myDebug) consoleLog(`case SyntaxKind.Identifier`);
                    Debug.assert(isIdentifier(condExpr));
                    const condSymbol = getResolvedSymbol(condExpr); // getSymbolOfNode()?
                    const isconst = isConstantReference(condExpr);
                    let type: RefTypesType | undefined = refTypesSymtabIn.get(condSymbol)?.leaf.type;
                    if (!type){
                        const tstype = getTypeOfSymbol(condSymbol);
                        if (tstype===errorType){
                            Debug.assert(false);
                        }
                        type = createRefTypesType(tstype);
                        refTypesSymtabIn.set(condSymbol, { leaf: createRefTypesTableLeaf(condSymbol, isconst, type) });
                    }
                    const byNode = createNodeToTypeMap();
                    byNode.set(condExpr, getTypeFromRefTypesType(type));
                    const inferRefRtnType = applyCritToRefTypesTable({
                        refTypesTable: createRefTypesTableReturn(condSymbol, isconst, type, refTypesSymtabIn),
                        crit
                    });
                    return {
                        inferRefRtnType,
                        byNode
                    };
                }
                /**
                 * NonNullExpression
                 */
                case SyntaxKind.NonNullExpression: {
                    /**
                     * TODO:
                     * The applyCritToRefTypesRtnArray loses the `symbolOfRtnType` per component refTypesRtn when it calls joinMerge... internally.
                     * Create another crit kind, or option, that will returns `RefTypesRtn[]`, without any loss of information.
                     * Then multiple crit can be applied in pipeline fashion before the merge.
                     */
                    Debug.assert(isNonNullExpression(condExpr));
                    return mrNarrowTypes({refTypesSymtab: refTypesSymtabIn, condExpr: condExpr.expression, crit: {kind: InferCritKind.twocrit, crits:[
                        { kind:InferCritKind.notnullundef },
                        crit
                    ]}, qdotfallout, doReplayMode});
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
                     * The sensible thing is for it to be the same as the ? operator (defined by JS runtime), binding only to the last element.
                     * In that case `qdotfallout` are not filtered here.
                     *
                     * However, it could be defined to apply to all preceding elements in a chain.
                     * That would require defining the limits of the chain -
                     * Does that cross getters, elements access, parentheses, call expressions, etc.
                     * In that case `qdotfallout` would filtered here, and the chain limits are where `qdotfallout` are terminated.
                     * It would be easy enough to filter `qdotfallout` here if required for, e.g., back compat.
                     */
                }
                /**
                 * PropertyAccessExpression
                 */
                case SyntaxKind.PropertyAccessExpression:
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.PropertyAccessExpression`);
                    return mrNarrowTypesByPropertyAccessExpression({ refTypesSymtab: refTypesSymtabIn, condExpr, crit, qdotfallout, doReplayMode });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(condExpr));
                    return mrNarrowTypesByCallExpression({ refTypesSymtab: refTypesSymtabIn, condExpr, crit, qdotfallout, doReplayMode });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((condExpr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const negCrit: InferCrit = { ...crit, negate:!crit.negate } as InferCrit;
                        return mrNarrowTypes({ refTypesSymtab: refTypesSymtabIn, condExpr:(condExpr as PrefixUnaryExpression).operand, crit:negCrit, qdotfallout, doReplayMode });
                    }
                    Debug.assert(false);
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(condExpr));
                    const rhs = mrNarrowTypes({ refTypesSymtab: refTypesSymtabIn, condExpr:condExpr.initializer!, crit:{ kind: InferCritKind.none }, qdotfallout, doReplayMode });
                    if (isIdentifier(condExpr.name)){
                        /**
                         * More processing and error checking of the lhs is taking place higher up in checkVariableLikeDeclaration.
                         */
                        /**
                         * qdotfallout content, if it exists, needs to be added back in now
                         */
                        const lhsSymbol = getSymbolOfNode(condExpr); // not condExpr.name
                        const isconst = isConstVariable(lhsSymbol);
                        const lhsRefTypesTableNonLeaf = mergeArrRefTypesTableReturnToRefTypesTableNonLeaf(lhsSymbol, isconst, [...qdotfallout, rhs.inferRefRtnType.passing]);
                        const { passing: lhsRefTypesTableReturn } = applyCritToRefTypesTable({
                            refTypesTable: lhsRefTypesTableNonLeaf,
                            crit: { kind: InferCritKind.none }
                        });
                        /**
                         * As the code stands, must convert RefTypesTableNonLeaf to RefTypesTableReturn although inference-usable info is lost in the process.
                         * That's a loss only if lhsSymbol is subject to future criteria.
                         * To releive that, for the last rhs assigned to lhsSymbol we could save extra state.
                         * Could consider saving lhsRefTypesTableNonLeaf in the symbol table (nonLead in addition to leaf).
                         * However, alias-replay, preferably with globalNodeToType so that non-pure-consts can be used, seems to be more
                         * logically complete, and probably take less memory.
                         */
                        return { inferRefRtnType: { passing: lhsRefTypesTableReturn }, byNode: rhs.byNode };
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
