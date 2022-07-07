namespace ts {

    export interface MrNarrow {
        mrNarrowTypes({ refTypes, condExpr, crit, qdotfallout }: InferRefArgs): InferRefRtnType;
        createRefTypes(): RefTypes;
        joinMergeRefTypes(aRefTypes: Readonly<RefTypes[]>): RefTypes;
        joinMergeRefTypesRtn(aRefTypesRtn: Readonly<RefTypesRtn[]>): RefTypesRtn;
    };

    export function createMrNarrow(checker: TypeChecker, _mrState: MrState): MrNarrow {


        const myDebug = getMyDebug();

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
        const forEachType = checker.forEachType;
        const typeToString = checker.typeToString;
        const getTypeOfSymbol = checker.getTypeOfSymbol;
        const isArrayType = checker.isArrayType;
        const isArrayOrTupleType = checker.isArrayOrTupleType;
        const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
        const getReturnTypeOfSignature = checker.getReturnTypeOfSignature;
        const isReadonlyProperty = checker.isReadonlyProperty;
        // const isConstVariable = checker.isConstVariable;
        const isConstantReference = checker.isConstantReference;
        const getNodeLinks = checker.getNodeLinks;

        const {
            //dbgGetNodeText,
            //dbgFlowToString,
            //dbgFlowTypeToString,
            dbgNodeToString,
            dbgSignatureToString,
            //dbgWriteSignatureArray,
            //dbgFlowNodeGroupToString
        } = createDbgs(checker);



        // @ ts-expect-error 6133
        function createRefTypes(): RefTypes {
            return {
                //byRef: new Map<Identifier, RefType>(),
                bySymbol: new Map<Symbol,RefType>()
            };
        }
        // @ ts-expect-error 6133
        function copyRefTypes(refTypes: RefTypes): RefTypes {
            /**
             * This didn't work because we must deep copy the values.
             */
            // const r: RefTypes = {
            //     bySymbol: new Map<Symbol, RefType>(refTypes.bySymbol)
            // };
            const newRefType = createRefTypes();
            refTypes.bySymbol.forEach((v,s)=>{
                newRefType.bySymbol.set(s, { ...v });
            });
            return newRefType;
        }
        // function uniquify<A extends any[]>(a: A): A{
        //     // Add the optimization back in after checking the Set code is working despite the warning.
        //     // if (a.length===1) return a;
        //     // else if (a.length===2){
        //     //     if (a[0]===a[1]) return a.slice(0,1);
        //     //     else return a;
        //     // }
        //     // else if (a.length===3){
        //     //     if (a[0]!==a[1] && a[0]!==a[2]) return a;
        //     // }
        //     // else if (!(a.slice(0,-1).some((x,i)=>x!==a[i+1]))){
        //     //     return a;
        //     // }
        //     const set = new Set<any>(a);
        //     // No overload matches this call.
        //     // Overload 1 of 4, '(iterable: Iterable<unknown> | ArrayLike<unknown>): unknown[]', gave the following error.
        //     //   Argument of type 'Iterator<any>' is not assignable to parameter of type 'Iterable<unknown> | ArrayLike<unknown>'.
        //     //     Property 'length' is missing in type 'Iterator<any>' but required in type 'ArrayLike<unknown>'.
        //     // Overload 2 of 4, '(arrayLike: ArrayLike<unknown>): unknown[]', gave the following error.
        //     //   Argument of type 'Iterator<any>' is not assignable to parameter of type 'ArrayLike<unknown>'.ts(2769)
        //     // -- But the Iterable<unknown> overload doesn't NEED "length" so it shouldn't matter.
        //     // @ts-expect-error 2769
        //     return Array.from(set.keys());
        // }

        /**
         * Assumes that target was the source of multiple branches, and that aRefTypes are the narrowed results of those branches.
         * Therefore each branches types, and the union of them, must be a subset of the target.
         * The target type is overwritten with the resulting union type.
         * Of course they must also all share the same symbols.
         * @param aRefTypes
         * @param target
         */
        function joinMergeRefTypes(aRefTypes: Readonly<RefTypes[]>): RefTypes {
            const mapSymToTypes = new Map<Symbol, RefType[]>();
            //const setRtnType = new Set<Type>();

            aRefTypes.forEach(rts=>{
                //setRtnType.add(rts.rtnType);
                rts.bySymbol.forEach((v,s)=>{
                    const x = mapSymToTypes.get(s);
                    if (!x) mapSymToTypes.set(s,[v]);
                    else x.push(v);
                });
            });

            // No overload matches this call.
            // Overload 1 of 4, '(iterable: Iterable<Type> | ArrayLike<Type>): Type[]', gave the following error.
            // Argument of type 'Iterator<Type>' is not assignable to parameter of type 'Iterable<Type> | ArrayLike<Type>'.
            // Property 'length' is missing in type 'Iterator<Type>' but required in type 'ArrayLike<Type>'.
            // Overload 2 of 4, '(arrayLike: ArrayLike<Type>): Type[]', gave the following error.
            // Argument of type 'Iterator<Type>' is not assignable to parameter of type 'ArrayLike<Type>'.ts(2769)

            const newRefTypes = createRefTypes();
            mapSymToTypes.forEach((av,s)=>{
                // 'const' values should all be same for the same symbol
                Debug.assert(av.length);
                const isconst = av[0].const;
                Debug.assert(!av.some(v => v.const !== isconst));
                const sett = new Set<Type>();
                av.forEach(v=>sett.add(v.type));
                // @ts-expect-error 2769
                const type = getUnionType(Array.from(sett.keys()), UnionReduction.Literal);
                newRefTypes.bySymbol.set(s,{ const:isconst,type });
            });
            return newRefTypes;
        };

        // @ts-expect-error
        function joinMergeRefTypesRtn(aRefTypesRtn: Readonly<RefTypesRtn[]>/*, symbolsOfRtnType: Symbol[]|undefined*/): RefTypesRtn {

            const aRtnTypes: Type[]=[];
            const aRefTypes: RefTypes[]=[];
            aRefTypesRtn.forEach(x=>{
                aRtnTypes.push(x.rtnType);
                aRefTypes.push(x.refTypes);
            });
            return {
                rtnType: checker.getUnionType(aRtnTypes,UnionReduction.Literal),
                symbolOfRtnType: undefined,
                refTypes: joinMergeRefTypes(aRefTypes)
            };
        }


        /**
         *
         */
        // for reference:
        // function getTypeWithFacts(type: Type, include: TypeFacts) {
        //     return filterType(type, t => (getTypeFacts(t) & include) !== 0);
        // }


        /**
         *
         * @param type
         * @param crit
         * @returns type narrowed by criterion crit
         */
        // @ts-ignore-error 6133
        function applyCrit<F extends (t: Type, pass: boolean, fail: boolean) => void>(type: Type,crit: InferCrit, func: F): void {
            if (crit.kind===InferCritKind.none) {
                checker.forEachType(type, t => {
                    func(t, /* pass */ true, /* fail */ false);
                });
            }
            else if (crit.kind===InferCritKind.truthy) {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
                checker.forEachType(type, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.notnullundef) {
                const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
                const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
                checker.forEachType(type, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.assignable) {
                checker.forEachType(type, source => {
                    let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                    if (crit.negate) rel = !rel;
                    func(source, rel, !rel);
                });
            }
            else {
                Debug.assert(false, "", ()=>crit.kind);
            }
        }
        // function applyCritToType(type: Type, crit: InferCrit): {passing: Type, failing: Type} {
        //     const pt: Type[]=[];
        //     const ft: Type[]=[];
        //     applyCrit(type, crit, (t,pass,fail)=>{
        //         if (pass) pt.push(t);
        //         if (fail) ft.push(t);
        //     });
        //     return {
        //         passing: getUnionType(pt, UnionReduction.Literal),
        //         failing: getUnionType(ft, UnionReduction.Literal)
        //     };
        // }

        function setOfTypeToUnionType(s: Set<Type>): Type{
            // @ts-expect-error 2769
            return getUnionType(Array.from(s.keys()),UnionReduction.Literal);
        }

        /**
         * NOTE: The component `RefTypesRtn` are not all separate copies - only those that have diverged are separate copies.
         */
        type ApplyCritToRefTypesRtnMapReturnType = & { passing?: RefTypesRtn, failing?: RefTypesRtn };
        // eslint-disable-next-line @typescript-eslint/naming-convention
        function applyCritToRefTypesRtnMap({refTypesRtn, crit, totalRtnType_pass, totalRtnType_fail}: {
            refTypesRtn: RefTypesRtn, crit: InferCrit, totalRtnType_pass: Set<Type>, totalRtnType_fail?: Set<Type>}): ApplyCritToRefTypesRtnMapReturnType {
            let pb=false;
            let fb=false;
            const rtnTypeSet_pass = new Set<Type>();
            const rtnTypeSet_fail = new Set<Type>();
            applyCrit(refTypesRtn.rtnType, crit, (t, pass, fail)=>{
                if (pass){
                    pb = true;
                    rtnTypeSet_pass.add(t);
                    totalRtnType_pass.add(t);
                }
                if (crit.alsoFailing && fail){
                    fb = true;
                    rtnTypeSet_fail.add(t);
                    totalRtnType_fail!.add(t);
                }
            });
            let passing: RefTypesRtn | undefined;
            let failing: RefTypesRtn | undefined;
            let refTypes_pass: RefTypes | undefined;
            let refTypes_fail: RefTypes | undefined;
            let rtnType_pass: Type | undefined;
            let rtnType_fail: Type | undefined;
            if (pb){
                rtnType_pass = setOfTypeToUnionType(rtnTypeSet_pass);
                refTypes_pass = copyRefTypes(refTypesRtn.refTypes);
                if (refTypesRtn.symbolOfRtnType) {
                    Debug.assert(refTypes_pass.bySymbol.get(refTypesRtn.symbolOfRtnType)!.type===refTypesRtn.rtnType);
                    refTypes_pass.bySymbol.get(refTypesRtn.symbolOfRtnType)!.type = rtnType_pass;
                }
                passing = { rtnType: rtnType_pass, refTypes: refTypes_pass, symbolOfRtnType: refTypesRtn.symbolOfRtnType };
            }
            if (fb && crit.alsoFailing){
                rtnType_fail = setOfTypeToUnionType(rtnTypeSet_fail);
                refTypes_fail = copyRefTypes(refTypesRtn.refTypes);
                if (refTypesRtn.symbolOfRtnType) {
                    Debug.assert(refTypes_fail.bySymbol.get(refTypesRtn.symbolOfRtnType)!.type===refTypesRtn.rtnType);
                    refTypes_fail.bySymbol.get(refTypesRtn.symbolOfRtnType)!.type = rtnType_fail;
                }
                failing = { rtnType: rtnType_fail, refTypes: refTypes_fail, symbolOfRtnType: refTypesRtn.symbolOfRtnType };
            }
            const retval: ApplyCritToRefTypesRtnMapReturnType = {};
            if (passing) retval.passing = passing;
            if (failing) retval.failing = failing;
            return retval;
        }

        // @ts-ignore-error 6133
        function applyCritToRefTypesRtnArray({aRefTypesRtn, crit}: {aRefTypesRtn: RefTypesRtn[], crit: InferCrit}): InferRefRtnType {
            if (crit.kind===InferCritKind.none) {
                Debug.assert(!crit.alsoFailing);
                const rtnTypeSet = new Set<Type>();
                aRefTypesRtn.forEach(rt=>forEachType(rt.rtnType, t=>rtnTypeSet.add(t)));
                const rtnType = setOfTypeToUnionType(rtnTypeSet);
                return {
                    passing: { rtnType, refTypes: joinMergeRefTypes(aRefTypesRtn.map(rtr=>rtr.refTypes)), symbolOfRtnType:undefined },
                };
            }
            const totalRtnType_pass = new Set<Type>();
            const totalRtnType_fail = crit.alsoFailing ? new Set<Type>() : undefined;
            const aRefTypes_passing: RefTypes[]=[];
            const aRefTypes_failing: RefTypes[]=[];
            aRefTypesRtn.map(refTypesRtn=> applyCritToRefTypesRtnMap({ refTypesRtn, crit, totalRtnType_pass, totalRtnType_fail })).forEach(({passing,failing})=>{
                if (passing) aRefTypes_passing.push(passing.refTypes);
                if (failing) aRefTypes_failing.push(failing.refTypes);
            });
            const retval: InferRefRtnType = {
                passing: {
                    rtnType: setOfTypeToUnionType(totalRtnType_pass),
                    refTypes: joinMergeRefTypes(aRefTypes_passing),
                    symbolOfRtnType: undefined
                }
            };
            if (crit.alsoFailing){
                retval.failing = {
                    rtnType: setOfTypeToUnionType(totalRtnType_fail!),
                    refTypes: joinMergeRefTypes(aRefTypes_failing),
                    symbolOfRtnType: undefined
                };
            }
            return retval;
        }
        // @ts-ignore-error 6133
        function applyTwoCritsToRefTypesRtnArray({aRefTypesRtn, crit0, crit1}: {aRefTypesRtn: RefTypesRtn[], crit0: InferCrit, crit1: InferCrit}): InferRefRtnType {
            if (crit0.alsoFailing){
                Debug.assert(false,"applyTwoCritsToRefTypesRtnArray: The 'alsoFailing' member of crit0 must be false");
            }
            // if (crit.kind===InferCritKind.none) {
            //     Debug.assert(!crit.alsoFailing);
            //     const rtnTypeSet = new Set<Type>();
            //     aRefTypesRtn.forEach(rt=>forEachType(rt.rtnType, t=>rtnTypeSet.add(t)));
            //     const rtnType = setOfTypeToUnionType(rtnTypeSet);
            //     return {
            //         passing: {rtnType, refTypes: joinMergeRefTypes(aRefTypesRtn.map(rtr=>rtr.refTypes)), symbolOfRtnType:undefined},
            //     };
            // }
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const totalRtnType_pass0 = new Set<Type>();
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const totalRtnType_pass1 = new Set<Type>();
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const totalRtnType_fail1 = crit1.alsoFailing ? new Set<Type>() : undefined;
            const aRefTypes_passing: RefTypes[]=[];
            const aRefTypes_failing: RefTypes[]=[];
            aRefTypesRtn.map(refTypesRtn=> applyCritToRefTypesRtnMap({ refTypesRtn, crit:crit0, totalRtnType_pass:totalRtnType_pass0, totalRtnType_fail:undefined }))
            .filter(({passing})=>passing)
            .map(({passing})=>passing!)
            .map(refTypesRtn=> applyCritToRefTypesRtnMap({ refTypesRtn, crit:crit1, totalRtnType_pass:totalRtnType_pass1, totalRtnType_fail:totalRtnType_fail1 }))
            .forEach(({passing,failing})=>{
                if (passing) aRefTypes_passing.push(passing.refTypes);
                if (failing) aRefTypes_failing.push(failing.refTypes);
            });
            const retval: InferRefRtnType = {
                passing: {
                    rtnType: setOfTypeToUnionType(totalRtnType_pass1),
                    refTypes: joinMergeRefTypes(aRefTypes_passing),
                    symbolOfRtnType: undefined
                }
            };
            if (crit1.alsoFailing){
                retval.failing = {
                    rtnType: setOfTypeToUnionType(totalRtnType_fail1!),
                    refTypes: joinMergeRefTypes(aRefTypes_failing),
                    symbolOfRtnType: undefined
                };
            }
            return retval;
        }

        // @ ts-ignore-error 6133
        function dbgLogRefTypes(refTypes: Readonly<RefTypes>, title?: string){
            consoleGroup(title??"refTypes:");
            refTypes.bySymbol.forEach((v,s)=>{
                let str = `symbol[${getSymbolId(s)}, ${s.escapedName}]: `;
                str += `type: ${typeToString(v.type)}, const: ${v.const}`;
                consoleLog(str);
            });
            consoleLog(`end of `+title??"refTypes:");
            consoleGroupEnd();
        }

        // @ ts-ignore-error 6133
        function mrNarrowTypesByCallExpression({refTypes:refTypesIn, condExpr:callExpr, crit, qdotfallout}: InferRefArgs & {condExpr: CallExpression}): InferRefRtnType {
            //return undefined as any as InferRefRtnType;
            Debug.assert(qdotfallout);
            // First duty is to call the precursors
            const pre = InferRefTypesPreAccess({ refTypes:refTypesIn, condExpr:callExpr, crit, qdotfallout }, /* symbolOfRtnType */ undefined);
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;
            const refTypes = prePassing.refTypes;
            if (myDebug) {
                consoleLog("candidates by return of pre");
                forEachType(prePassing.rtnType, t => consoleLog(typeToString(t)));
                consoleLog("end of candidates by return of pre");
            }
            /**
             * Collect all of the individual signatures from each candidate to create a single signature candidate set.
             */
            //let someSigLookupFailed = false;
            const allsigs: Signature[]=[];
            forEachType(prePassing.rtnType, (t: Type) => {
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
                refTypesRtn?: RefTypesRtn; // only when pass is true
            };
            const matchedSigs = allsigs.map((sig: Readonly<Signature>,_sigidx: number): MatchedSig => {
                let sargidx = -1;
                let sargRestElemType: Type | undefined;
                let sargRestSymbol: Symbol | undefined;
                let rtsrtn: RefTypesRtn = { rtnType:neverType, refTypes, symbolOfRtnType:undefined };
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
                    forEachType(targetType, t=>{
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
                    const qdotfallout: InferTypeArgsQDotFallout=[];
                    const {passing,failing} = mrNarrowTypes({
                        refTypes:rtsrtn.refTypes,
                        condExpr: carg,
                        crit: {
                            kind: InferCritKind.assignable,
                            target: targetType,
                            // negate: false,
                            alsoFailing:true,
                        },
                        qdotfallout
                    });
                    rtsrtn = passing;
                    if (qdotfallout.length && !targetTypeIncludesUndefined){
                        consoleLog(
                            `Deferred Error: possible type of undefined/null can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    else if (failing?.rtnType !== neverType){
                        consoleLog(
                            `Deferred Error: possible type of ${
                                typeToString(failing!.rtnType)
                            } can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    return true;
                });
                if (!pass){
                    return { pass:false, sig };
                }
                else {
                    if (sig.resolvedReturnType) rtsrtn.rtnType = sig.resolvedReturnType;
                    else rtsrtn.rtnType = getReturnTypeOfSignature(sig);
                    // if (!sig.resolvedReturnType){
                    //     const type = getReturnTypeOfSignature(sig);
                    //     // Debug.assert(sig.resolvedReturnType);
                    // }
                    // rtsrtn.rtnType = sig.resolvedReturnType!;
                    return { pass:true, sig, refTypesRtn: rtsrtn };
                }
            });

            if (myDebug) {
                matchedSigs.forEach((ms,msidx)=>{
                    consoleGroup(`sig[${msidx}], pass:${ms.pass}, rtnType: ${ms.refTypesRtn?.rtnType ? typeToString(ms.refTypesRtn.rtnType):"N/A"}}`);
                    consoleGroup(dbgSignatureToString(ms.sig));
                    if (ms.pass){
                        dbgLogRefTypes(ms.refTypesRtn!.refTypes);
                    }
                    consoleGroupEnd();
                    consoleGroupEnd();
                });
            }
            const aRefTypesRtn = matchedSigs.filter(ms=>ms.pass).map(ms=>ms.refTypesRtn!);

            // /**
            //  * TODO:
            //  * Do something so the queries on CallExpression yield only the passed signatures as valid candidates.
            //  * In no signatures are valid it is an error.
            //  */
            /**
             * Note: if there were no passed signatures then 'never' return type will (should) occur with no extra work.
             */
            return applyCritToRefTypesRtnArray({ aRefTypesRtn, crit });
        }

        type InferRefTypesPreAccessRtnType = & {
            kind: "immediateReturn",
            retval: InferRefRtnType
        } | {
            kind: "normal",
            passing: RefTypesRtn
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
        function InferRefTypesPreAccess({refTypes, condExpr, crit, qdotfallout}: InferRefArgs & {condExpr: {expression: Expression}}, symbolOfRtnType: Symbol | undefined): InferRefTypesPreAccessRtnType{
            const {passing, failing } = mrNarrowTypes(
                { refTypes, condExpr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout });
            Debug.assert(failing);
            if (failing.rtnType!==neverType){
                if (isPropertyAccessExpression(condExpr) && condExpr.questionDotToken){
                    qdotfallout.push(failing); // The caller of InferRefTypesPreAccess need deal with this no further.
                }
                else {
                    if (myDebug) consoleLog(`Error: expression ${dbgNodeToString(condExpr)} cannot be applied to undefined or null.  Add '?' or '!' if appropriate.`);
                }
            }
            if (passing.rtnType === neverType){
                const aRefTypesRtn: RefTypesRtn[] = [{ rtnType:neverType, refTypes:passing.refTypes, symbolOfRtnType }];
                return { kind:"immediateReturn", retval: applyCritToRefTypesRtnArray({ aRefTypesRtn, crit }) };
            }
            return { kind:"normal", passing };
        }

        function mrNarrowTypesByPropertyAccessExpression({refTypes, condExpr, crit, qdotfallout}: InferRefArgs): InferRefRtnType {
            if (myDebug) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypes, condExpr, crit, qdotfallout });
            if (myDebug) {
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        function mrNarrowTypesByPropertyAccessExpression_aux({refTypes:refTypesIn, condExpr, crit, qdotfallout}: InferRefArgs): InferRefRtnType {
            /**
             * It doesn't really make much sense for the PropertyAccessExpression to have a symbol because the property name is simply a key
             * that may be used to lookup across totally unrelated objects that are present only ambiently in the code - unless the precursor is a constant.
             * In that way it not so much different from a call expression, which never has a symbol.
             *
             * On the other hand, if the looked up properties are symbols - which the standard case - then it doesn't make sense to ignore those symbol because they may correspond to
             * identifiers with symbol and constrained values that should be added to the refTypes if not already there - and if already existing in refTypes then the possibly narrowed existing type range should be
             * used to contribute to the return value (rather than the declared value.)
             *
             * For the above reasons we will ignore the symbol `getNodeLinks(condExpr).resolvedSymbol;`
             * but address any lokoed-up property symbols as discussed above.
             *
             * An implication is that constraints imposed by crit or successor NonNullExpression (!) operator must be applied to multiple symbols if neccesary,
             * so `symbolOfRtnType` must be changed `symbolsOfRtnType`.
             */
            //const condExprSymbol = getNodeLinks(condExpr).resolvedSymbol; // may or may not exist
            //if (myDebug && !condExprSymbol) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: condExpr: ${dbgNodeToString(condExpr)}, getNodeLinks(condExpr).resolvedSymbol is undefined`);
            Debug.assert(isPropertyAccessExpression(condExpr));
            Debug.assert(condExpr.expression);


            const pre = InferRefTypesPreAccess({ refTypes:refTypesIn, condExpr, crit, qdotfallout }, /* symbolOfRtnType */ undefined);
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;

            /**
             * Use refTypes from pre.
             */
            const refTypes = prePassing.refTypes;
            // Debug.assert(condExprSymbol);
            // Debug.assert(refTypes.bySymbol.has(condExprSymbol));
            // const condExprRefType = refTypes.bySymbol.get(condExprSymbol)!;


            // Each lookup is a searate virtual branch, so requires its own refTypesRtn.

            const aRefTypesRtn: RefTypesRtn[]=[];

            // TODO: Improve this section by using the function defined under "interface Type " in types.ts
            //const symbolsOfRtnType: Symbol[]=[];
            //const propRefTypes = createRefTypes();
            const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean}[]=[];
            const keystr = condExpr.name.escapedText as string;
            forEachType(prePassing.rtnType, t => {

                if (t===undefinedType||t===nullType) {
                    Debug.assert(false);
                }
                if (!(t.flags & TypeFlags.Object)){
                    accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                    aRefTypesRtn.push({ rtnType:undefinedType,refTypes:copyRefTypes(refTypes), symbolOfRtnType: undefined });
                    return;
                }
                if (isArrayOrTupleType(t)) {
                    if (keystr==="length") {
                        accessedTypes.push({ baseType: t, type:numberType, optional:false });
                        aRefTypesRtn.push({ rtnType:numberType,refTypes:copyRefTypes(refTypes), symbolOfRtnType: undefined });
                    }
                    else {
                        accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                        aRefTypesRtn.push({ rtnType:undefinedType,refTypes:copyRefTypes(refTypes), symbolOfRtnType: undefined });
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
                    let resolvedType = declaredType;
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
                    if (narrowable){
                        //symbolsOfRtnType.push(propSymbol);
                        const existingRefType = refTypes.bySymbol.get(propSymbol);
                        if (existingRefType){
                            resolvedType = existingRefType.type;
                            Debug.assert(existingRefType.const===readonlyProp);
                        }
                        else {
                            consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: adding new symbol to ref types, {symbol:<${
                                propSymbol.escapedName},${getSymbolId(propSymbol)}>, type ${typeToString(declaredType)}, const:${readonlyProp}`);
                            refTypes.bySymbol.set(propSymbol, { const:readonlyProp, type:declaredType });
                        }
                    }
                    aRefTypesRtn.push({ rtnType:resolvedType, refTypes:copyRefTypes(refTypes), symbolOfRtnType: narrowable?propSymbol:undefined });
                    accessedTypes.push({ baseType: t, type:resolvedType, declaredType, optional: optionalProp, readonlyProp });
                    return;
                }
                Debug.assert(false);
                // const indexInfos = checker.getIndexInfosOfType(t);
                // if (indexInfos){
                //     indexInfos.forEach(ii=>{
                //         if (ii.keyType === stringType){
                //             accessedTypes.push({baseType: t, type:ii.type, optional:false});
                //         }
                //         else if (ii.keyType === numberType){
                //             if (!isNaN(Number(keystr))){
                //                 accessedTypes.push({baseType: t, type:ii.type, optional:false});
                //             }
                //             else {
                //                 // TODO: Error
                //                 accessedTypes.push({baseType: t, type:undefinedType, lookupFail: true, optional:false});
                //             };
                //         }
                //         else {
                //             // TODO: string template keys checking
                //             accessedTypes.push({baseType: t, type:ii.type, optional:false});
                //         }
                //     });
                //     return;
                //}
                //accessedTypes.push({baseType: t, type: undefinedType, lookupFail: true, optional:false});
            });
            if (myDebug){
                consoleLog(`propertyTypes:`);
                accessedTypes.forEach(t=> {
                    consoleLog(`baseType:${typeToString(t.baseType)}, propType:${typeToString(t.type)}, optional:${t.optional}, lookupFail:${t.lookupFail}, readonlyProp: ${t.readonlyProp} `);
                });
                consoleLog(`end propertyTypes:`);
            }
            // const setPropTypes = new Set<Type>();
            // accessedTypes.forEach(at=>{
            //     if (at.lookupFail) return;
            //     if (at.optional) setPropTypes.add(undefinedType);
            //     setPropTypes.add(at.type);
            // });
            // // @ts-expect-error 2769
            // const rtnType = getUnionType(Array.from(setPropTypes.keys()), UnionReduction.Literal);
            //const setITypes = new Set<Type>();
            //let rtnType: Type
            // if (condExprRefType.type===anyType){
            //     rtnType = proptype;
            // }
            // else {
            //     forEachType(condExprRefType.type, t=>{
            //         if (setPropTypes.has(t)) setITypes.add(t);
            //         else if (t===undefinedType||t===neverType) return;
            //         else if (isTypeRelatedTo(t,proptype,subtypeRelation) /* || isTypeRelatedTo(proptype,t,subtypeRelation) */) setITypes.add(t);
            //     });
            //     setPropTypes.forEach(t=>{
            //         if (isTypeRelatedTo(t,condExprRefType.type,subtypeRelation)) setITypes.add(t);
            //     });
            //     // @ts-expect-error 2769
            //     rtnType = getUnionType(Array.from(setITypes.keys()), UnionReduction.Literal);
            // }
            if (myDebug){
                consoleLog(`aRefTypesRtn:`);
                // consoleGroup("");
                // forEachType(proptype, t=>consoleLog(typeToString(t)));
                // consoleGroupEnd();
                // consoleLog(`lookedup types constraint:`);
                // consoleGroup("");
                // forEachType(condExprRefType.type, t=>consoleLog(typeToString(t)));
                // consoleGroupEnd();
                // consoleLog(`their intersection:`);
                aRefTypesRtn.forEach((rtr,rtri)=>{
                    consoleGroup(`[${rtri}]:`);
                    consoleLog(`rtnType: ${typeToString(rtr.rtnType)}`);
                    dbgLogRefTypes(rtr.refTypes);
                    consoleLog(`symbolOfRtnType: ${rtr.symbolOfRtnType?`<${rtr.symbolOfRtnType.escapedName},${getSymbolId(rtr.symbolOfRtnType)}>`:"<undef>"}`);
                    consoleGroupEnd();
                });
                consoleLog(`end aRefTypesRtn`);
            }
            // condExprRefType is actually a reference to storage, but lets update via the handle anyway:
            //refTypes.bySymbol.get(condExprSymbol)!.type = rtnType;

            //const hasUndefinedOrNullType = accessedTypes.some(x=>(x.type===undefinedType||x.type===nullType));
            const hasFailedLookup = accessedTypes.some(x=>x.lookupFail);
            const hasSuccessLookup = accessedTypes.some(x=>!x.lookupFail);
            //const hasOptional = accessedTypes.some(x=>x.optional);

            let requirePropertyDefinedForEachSubtype = false;
            requirePropertyDefinedForEachSubtype = false;
            if (requirePropertyDefinedForEachSubtype && hasFailedLookup){
                // TODO: output error
            }
            else if (!hasSuccessLookup){
                // TODO: output error
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: no lookups were successful`);
            }
            return applyCritToRefTypesRtnArray({ aRefTypesRtn, crit });
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypes({refTypes, condExpr, crit, qdotfallout}: InferRefArgs): InferRefRtnType {
            if (myDebug) {
                consoleGroup(`mrNarrowTypes[in] condExpr:${dbgNodeToString(condExpr)}, crit.kind: ${crit.kind}, crit.negate: ${crit.negate}, crit.alsoFailing ${crit.alsoFailing}`);
            }
            const r = mrNarrowTypes_aux({ refTypes, condExpr, crit, qdotfallout });
            if (myDebug) {
                consoleLog(`mrNarrowTypes[out] condExpr:${dbgNodeToString(condExpr)}, crit.kind: ${crit.kind} -> { passing: ${typeToString(r.passing.rtnType)}, failing: ${
                    r.failing ? typeToString(r.failing.rtnType) : ""}}`);
                dbgLogRefTypes(r.passing.refTypes, "passing.refTypes");
                if (r.failing) {
                    dbgLogRefTypes(r.failing.refTypes, "failing.refTypes");
                }
                consoleGroupEnd();
            }
            return r;
        }

        function mrNarrowTypes_aux({refTypes, condExpr, crit, qdotfallout}: InferRefArgs): InferRefRtnType {
            const condSymbol = getNodeLinks(condExpr).resolvedSymbol; // may or may not exist
            let condRefType: RefType | undefined;
            {
                const condExprConst = isConstantReference(condExpr);
                if (myDebug && !condSymbol){
                    consoleLog(`mrNarrowTypes[dbg]: node with no symbol, {node: ${dbgNodeToString(condExpr)}, const:${condExprConst}`);
                }
                condRefType = condSymbol && refTypes.bySymbol.get(condSymbol);
                /**
                 * If the refType isn't there but could have been, add it.
                 * For the purpose of evaluating a sourceElement level expression, non-const references should also be included,
                 * because the non-const are const within the expression and that can be leveraged.
                 * Exception is when a non-const is assigned within the expression - then it is more complicated.
                 * TODO: At least check for such assignments.
                 * Between source levels expressions, the non-consts should be removed (unless they provably do not change between them).
                 *
                 */
                if (condRefType) Debug.assert(condExprConst===condRefType.const); // hopefully yes!
                Debug.assert(condExprConst ? condSymbol : true);

                if (condSymbol && !condRefType){
                    const type = anyType; //checkExpressionCache.get(condExpr);
                    Debug.assert(type);
                    condRefType = { type, const:condExprConst };
                    if (myDebug){
                        consoleLog(`mrNarrowTypes[dbg]: adding new symbol to ref types, {symbol:<${condSymbol.escapedName},${getSymbolId(condSymbol)}>, type ${typeToString(type)}, const:${condExprConst}`);
                    }
                    refTypes.bySymbol.set(condSymbol, condRefType);
                }
            }
            switch (condExpr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    if (myDebug) consoleLog(`case SyntaxKind.Identifier`);
                    Debug.assert(condSymbol);
                    // if (mrState.aliasableAssignmentsCache.bySymbol.has(condSymbol)){
                    //     mrState.aliasInlineLevel++;
                    //     const aliasCondExpr = aliasableAssignmentsCache.bySymbol.get(condSymbol)!.expr;
                    //     if (myDebug) {
                    //         consoleLog(`mrNarrowTypes[dbg]: alias ${dbgNodeToString(aliasCondExpr)}, inlineLevel: ${aliasInferInlineLevel}`);
                    //     }
                    //     const irt = mrNarrowTypes({ refTypes, condExpr:aliasCondExpr, crit, qdotfallout });
                    //     mrState.aliasInlineLevel--;
                    //     return irt;
                    // }
                    const tmpRtnType = anyType; // condRefType?.type ?? checkExpressionCache.get(condExpr);
                    Debug.assert(tmpRtnType);
                    return applyCritToRefTypesRtnArray({aRefTypesRtn:[{
                        rtnType: tmpRtnType,
                        symbolOfRtnType: condSymbol,
                        refTypes
                    }], crit});
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
                    return mrNarrowTypes({refTypes, condExpr: condExpr.expression, crit: {kind: InferCritKind.twocrit, crits:[
                        { kind:InferCritKind.notnullundef },
                        crit
                    ]}, qdotfallout});
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
                    return mrNarrowTypesByPropertyAccessExpression({ refTypes, condExpr, crit, qdotfallout });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(condExpr));
                    return mrNarrowTypesByCallExpression({ refTypes, condExpr, crit, qdotfallout });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((condExpr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const negCrit: InferCrit = { ...crit, negate:!crit.negate } as InferCrit;
                        return mrNarrowTypes({ refTypes, condExpr:(condExpr as PrefixUnaryExpression).operand, crit:negCrit, qdotfallout });
                    }
                    Debug.assert(false);
                    break;
            default: Debug.assert(false, "", ()=>Debug.formatSyntaxKind(condExpr.kind));
            }
        }

        return {
            mrNarrowTypes,
            createRefTypes,
            joinMergeRefTypes,
            joinMergeRefTypesRtn
        };

    } // createMrNarrow


}
