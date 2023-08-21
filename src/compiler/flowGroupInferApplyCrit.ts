namespace ts {
    const checker: TypeChecker = undefined as any as TypeChecker;
    const getDeclaredType: GetDeclaredTypeFn = undefined as any as GetDeclaredTypeFn;
    const mrNarrow: MrNarrow = undefined as any as MrNarrow;

    export function initFlowGroupInferApplyCrit(checkerIn: TypeChecker, mrNarrowIn: MrNarrow): void {
        (checker as any) = checkerIn;
        (mrNarrow as any) = mrNarrowIn;
        (getDeclaredType as any) = mrNarrowIn.getDeclaredType;
    }

    function createNever(): RefTypesTableReturnNoSymbol {
        return {
            type: floughTypeModule.createRefTypesType(),
            sci: createRefTypesSymtabConstraintItemNever()
        };
    }

    export type CritToTypeV2Result = FloughType | undefined;
    export function applyCritToTypeV2(rt: Readonly<FloughType>,crit: Readonly<InferCrit>): {pass: CritToTypeV2Result, fail?: CritToTypeV2Result } {
        //const crit = critIn;
        const {logicalObject, remaining} = floughTypeModule.splitLogicalObject(rt);
        const arrtstype = floughTypeModule.getTsTypesFromFloughType(remaining);

        function worker(crit: Readonly<InferCrit>){
            if (crit.kind===InferCritKind.truthy) {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const arrpass: Type[] = arrtstype.filter(t=>(checker.getTypeFacts(t)&pfacts));
                const logobjpass = crit.negate ? undefined : logicalObject;
                // if (arrpass.length===arrtstype.length) {
                //     return rt; // no change,
                //     //return true; // not using the "true" optimization, because it is not clear if it is worth it
                // }
                // else
                if (logobjpass){
                    if (arrpass.length===arrtstype.length) return rt;
                    if (arrpass.length===0) return floughTypeModule.createTypeFromLogicalObject(logobjpass);
                    return floughTypeModule.createFromTsTypes(arrpass, logobjpass);
                }
                else {
                    return floughTypeModule.createFromTsTypes(arrpass);
                }
            }
            else Debug.fail("not yet implemented: "+crit.kind);
        }

        const ret: ReturnType<typeof applyCritToTypeV2> = {
            pass: worker(crit),
        };
        if (crit.alsoFailing) ret.fail = worker({ ...crit, negate:!crit.negate } as Readonly<InferCrit>);
        (crit as any).done = true;
        return ret;
    }

    function applyCritToTypeMutate(rt: Readonly<RefTypesType>,crit: Readonly<InferCrit>, passtype: RefTypesType, failtype?: RefTypesType | undefined): void {
        Debug.assert(!crit.done);
        Debug.assert(crit.kind!==InferCritKind.none);
        if (crit.kind===InferCritKind.truthy) {
            if (crit.alsoFailing){
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
               floughTypeModule.forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    if (tf&pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                    if (tf&ffacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t,failtype!);
                });
            }
            else {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
               floughTypeModule.forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    if (tf&pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                });
            }
        }
        else if (crit.kind===InferCritKind.notnullundef) {
            const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
            const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
           floughTypeModule.forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t);
                if (tf&pfacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                if (failtype && tf&ffacts) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(t,failtype);
            });
        }
        else if (crit.kind===InferCritKind.assignable) {
            const assignableRelation = checker.getRelations().assignableRelation;
            floughTypeModule.forEachRefTypesTypeType(rt, source => {
                let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                if (crit.negate) rel = !rel;
                if (rel) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, passtype);
                else if (failtype) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, failtype);
            });
        }
        else if (crit.kind===InferCritKind.subtype) {
            const subtypeRelation = checker.getRelations().subtypeRelation;
            floughTypeModule.forEachRefTypesTypeType(rt, source => {
                let rel = checker.isTypeRelatedTo(source, crit.target, subtypeRelation);
                if (crit.negate) rel = !rel;
                if (rel) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, passtype);
                else if (failtype) floughTypeModule.addTsTypeNonUnionToRefTypesTypeMutate(source, failtype);
            });
        }
        else {
            // @ts-ignore
            Debug.fail("unexpected ", ()=>crit.kind);
        }
    }

    export type SymbolWithAttributes = & { symbol: Symbol,isconst: boolean | undefined,isAssign?: boolean };

    export function getSymbolIfUnique(arrRttr: Readonly<RefTypesTableReturn[]>): { symbol: Symbol,isconst: boolean | undefined,isAssign?: boolean } | undefined {
        const length = arrRttr.length;
        if (length===0) return undefined;
        if (!arrRttr[0].symbol) return undefined;
        const { symbol, isconst:isconst, isAssign } = arrRttr[0];
        if (length===1) return { symbol, isconst, isAssign };
        for (let i=1; i!==length; i++){
            if (arrRttr[i].symbol!==symbol) return undefined;
        }
        return { symbol, isconst, isAssign };
    }

    export function orIntoNodeToTypeMap(type: Readonly<RefTypesType>, node: Node, nodeToTypeMap: NodeToTypeMap){
        const tstype = floughTypeModule.getTypeFromRefTypesType(type);
        const got = nodeToTypeMap.get(node);
        if (!got) nodeToTypeMap.set(node,tstype);
        else nodeToTypeMap.set(node,checker.getUnionType([got,tstype],UnionReduction.Literal));
        if (getMyDebug()){
            consoleLog(`orIntoNodeToTypeMap(type:${floughTypeModule.dbgFloughTypeToString(type)},node:${dbgsModule.dbgNodeToString(node)})::`
                +`${got?dbgsModule.dbgTypeToString(got):"*"}->${dbgsModule.dbgTypeToString(nodeToTypeMap.get(node)!)}`);
        }
    }
    export function orTsTypesIntoNodeToTypeMap(tstypes: Readonly<Type[]>, node: Node, nodeToTypeMap: NodeToTypeMap){
        const got = nodeToTypeMap.get(node);
        if (!got) nodeToTypeMap.set(node,checker.getUnionType(tstypes as Type[], UnionReduction.Literal));
        else nodeToTypeMap.set(node,checker.getUnionType([got,...tstypes as Type[]],UnionReduction.Literal));
        if (getMyDebug()){
            const dbgTstype = checker.getUnionType(tstypes as Type[], UnionReduction.Literal);
            consoleLog(`orTsTypesIntoNodeToTypeMap(types:${dbgsModule.dbgTypeToString(dbgTstype)},node:${dbgsModule.dbgNodeToString(node)})::`
                +`${got?dbgsModule.dbgTypeToString(got):"*"}->${dbgsModule.dbgTypeToString(nodeToTypeMap.get(node)!)}`);
        }
    }

    /**
     *
     * @param rttr
     * @param nodeForMap
     * @param nodeToTypeMap
     * @returns RefTypesTableReturnNoSymbol
     */
    export function applyCritNoneToOne(rttr: Readonly<RefTypesTableReturn>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        if (!rttr.symbol){
            if (nodeToTypeMap) orIntoNodeToTypeMap(rttr.type,nodeForMap,nodeToTypeMap);
            //nodeToTypeMap?.set(nodeForMap,floughTypeModule.getTypeFromRefTypesType(rttr.type));
            return rttr;
        }
        const {type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, sc:rttr.sci,
            mrNarrow, getDeclaredType});
        if (nodeToTypeMap) orIntoNodeToTypeMap(type,nodeForMap,nodeToTypeMap);
        return {
            type,
            sci: sc
        };
    }

    export function applyCritNoneUnion(x: Readonly<FloughReturn>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        return applyCritNone1Union(x.unmerged, x.nodeForMap, nodeToTypeMap);
    }
    export function applyCritNone1Union(arrRttr: Readonly<RefTypesTableReturn[]>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        if (arrRttr.length===0) return createNever();
        if (arrRttr.length===1) return applyCritNoneToOne(arrRttr[0],nodeForMap,nodeToTypeMap);

        const atype: RefTypesType[] = [];
        const asc: RefTypesSymtabConstraintItem[] = [];

        arrRttr.forEach(rttr=>{
            let type: RefTypesType;
            let sc: RefTypesSymtabConstraintItem;
            if (rttr.symbol){
                ({type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, getDeclaredType,
                    sc:rttr.sci, mrNarrow}));
                if (floughTypeModule.isNeverType(type)) return;
                if (extraAsserts){
                    Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
                }
                atype.push(type);
                asc.push(sc);
            }
            else {
                if (floughTypeModule.isNeverType(rttr.type)) return;
                if (extraAsserts){
                    Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                atype.push(rttr.type);
                asc.push(rttr.sci);
            }
        });
        const type = floughTypeModule.unionOfRefTypesType(atype);
        if (nodeToTypeMap) orIntoNodeToTypeMap(type,nodeForMap,nodeToTypeMap);
        const sci = orSymtabConstraints(asc/*,mrNarrow*/);
        return {
            type, sci
        };
    }

    function applyCritV2(x: Readonly<FloughReturn>, crit: Readonly<InferCrit>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        // type ModifyArgForCall = & {funcType: FloughType | undefined, undefinedAllowed: boolean };
        // @ts-expect-error
        const unmerged = x.unmerged.map(rttr=>{
            applyCritNoneToOne(rttr,x.nodeForMap,nodeToTypeMap);
        });


        if (x.forCrit?.logicalObjectAccessReturn) {
            Debug.assert(crit.kind!==InferCritKind.none);
            Debug.assert(!crit.done!);
            const loar = x.forCrit.logicalObjectAccessReturn;
            //Debug.assert(loar.finalTypes.length===x.unmerged.length);
            if (crit.kind===InferCritKind.truthy) {
                if (x.forCrit.callExpressionResult){
                    const callExpressionResult = x.forCrit.callExpressionResult;
                    Debug.assert(callExpressionResult.perFuncs.length===loar.finalTypes.length);
                    // set up a passs,fail type pair for each perFunc

                    const passTypes0: FloughType[] = [];
                    const passScis0: RefTypesSymtabConstraintItem[] = [];
                    const passFuncTypes0: (FloughType | undefined)[] = [];
                    const passUndfinedAllowed0: boolean[] = [];
                    // const passModifyArgs0: ModifyArgForCall[] = [];
                    const failTypes0: FloughType[] = [];
                    const failScis0: RefTypesSymtabConstraintItem[] = [];
                    const failFuncTypes0: (FloughType | undefined)[] = [];
                    const failUndfinedAllowed0: boolean[] = [];
                    // const failModifyArgs0: ModifyArgForCall[] = [];
                    let indexFunc = -1;
                    /**
                     * Note: even if the type evals to never under crit, a path may still exist because of "allowUndefined", i.e.,
                     * the carried qdot undefined is in play.  If so, the symbol constraint should not be set to never.
                     */
                    for (const perFunc of x.forCrit.callExpressionResult.perFuncs){
                        indexFunc++;
                        if (!perFunc.functionTsObject) continue;
                        const passTypes: FloughType[] = [];
                        const failTypes: FloughType[] = [];
                        const passScis: RefTypesSymtabConstraintItem[] = [];
                        const failScis: RefTypesSymtabConstraintItem[] = [];
                        const sigReturnTsTypes: Type[] = [];
                        for (const perSig of perFunc.perSigs){
                            sigReturnTsTypes.push(perSig.signatureReturnType);
                            if (floughTypeModule.isNeverType(perSig.rttr.type)) continue;
                            // assuming perSig.rttr.type does not include any carried qdot undefined
                            const {pass,fail} = applyCritToTypeV2(floughTypeModule.createFromTsType(perSig.signatureReturnType), crit);
                            if (pass && !floughTypeModule.isNeverType(pass)) {
                                passTypes.push(pass);
                                passScis.push(perSig.rttr.sci);
                            }
                            if (fail && !floughTypeModule.isNeverType(fail)) {
                                failTypes.push(fail);
                                failScis.push(perSig.rttr.sci);
                            }
                        }
                        // const usigSigReturnTsType = checker.getUnionType(sigReturnTsTypes, UnionReduction.Literal);
                        // //const usigReturnTypeHasUndefined = checker.getTypeFacts(usigSigReturnTsType) & TypeFacts.EQUndefined;
                        // const orsig = (types: FloughType[], scis: RefTypesSymtabConstraintItem[]): [
                        //     type:FloughType,sci:RefTypesSymtabConstraintItem, functType: boolean, carriedQdotUndefined: boolean
                        // ] => {
                        //     if (types.length===0) {
                        //         return [floughTypeModule.getNeverType(), createRefTypesSymtabConstraintItemNever(), false, false];
                        //     }
                        //     else {
                        //         const ut = floughTypeModule.unionOfRefTypesType(types);
                        //         // const modLogObj = floughTypeModule.getLogicalObject(loar.finalTypes[indexFunc].type);
                        //         // Debug.assert(modLogObj);
                        //         //const utNonObj = floughTypeModule.hasUndefinedType(ut) ? floughTypeModule.createUndefinedType() : floughTypeModule.getNeverType();
                        //         // If ut contains undefined, but the signature(s) (i.e. the sigs corresponding to modLogObj) return type(s) do not, then
                        //         // modLogObj should be undefined

                        //         // if (usigReturnTypeHasUndefined===0 && floughTypeModule.hasUndefinedType(ut)){
                        //         //     return [ut,orSymtabConstraints(scis),false,true];
                        //         // }
                        //         return [ut,orSymtabConstraints(scis), true, !!usigReturnTypeHasUndefined];
                        //     }
                        // };
                        const funcType = floughTypeModule.createFromTsType(perFunc.functionTsObject);
                        {
                            if (passTypes.length===0){
                                passTypes0.push(floughTypeModule.getNeverType());
                                passFuncTypes0.push(undefined);
                            }
                            else {
                                passTypes0.push(floughTypeModule.unionOfRefTypesType(passTypes));
                                passFuncTypes0.push(funcType);
                            }
                            passScis0.push(orSymtabConstraints(passScis));
                            passUndfinedAllowed0.push(false);
                        }
                        if (crit.alsoFailing){
                            if (failTypes.length===0){
                                failTypes0.push(floughTypeModule.getNeverType());
                                failFuncTypes0.push(undefined);
                            }
                            else {
                                failTypes0.push(floughTypeModule.unionOfRefTypesType(failTypes));
                                failFuncTypes0.push(funcType);
                            }
                            if (failScis.length===0) {
                                failScis0.push(createRefTypesSymtabConstraintItemAlways());
                            }
                            else failScis0.push(orSymtabConstraints(failScis));
                            failUndfinedAllowed0.push(true && x.forCrit.callExpressionResult.perFuncs[indexFunc].carriedQdotUndefined);
                        }
                    }
                    const makeRttr = (types: FloughType[], scis: RefTypesSymtabConstraintItem[], funcTypes: Readonly<(FloughType | undefined)[]>, undefinedAlloweds: boolean[]): RefTypesTableReturnNoSymbol => {
                        const { rootLogicalObject, rootNonObj } = floughLogicalObjectModule.logicalObjectModify(
                            funcTypes, loar, undefinedAlloweds);
                        const type = floughTypeModule.unionOfRefTypesType(types);
                        if (undefinedAlloweds.some(x=>x)) floughTypeModule.addUndefinedTypeMutate(type);
                        if (floughTypeModule.isNeverType(type)){
                            return { type, sci: createRefTypesSymtabConstraintItemNever() };
                        }
                        else {
                            const sci = copyRefTypesSymtabConstraintItem(orSymtabConstraints(scis));
                            if (extraAsserts) {
                                Debug.assert(sci.symtab);
                                Debug.assert(rootLogicalObject||rootNonObj);
                            }
                            sci.symtab!.set(
                                loar.rootsWithSymbols[0].symbol!,
                                floughTypeModule.createTypeFromLogicalObject(rootLogicalObject, rootNonObj));
                            return { type, sci };
                        }
                    };
                    (crit as InferCrit).done = true; // note: overriding readonly
                    return {
                        passing:makeRttr(passTypes0,passScis0,passFuncTypes0,passUndfinedAllowed0),
                        failing:makeRttr(failTypes0,failScis0,failFuncTypes0,failUndfinedAllowed0)
                    };
                }
                else Debug.fail("not yet implemented");
            }
            else Debug.fail("not yet implemented");
        }
        else Debug.fail("not yet implemented");


        // {
        //     const { rootLogicalObject, rootNonObj} = floughLogicalObjectModule.logicalObjectModify(critTypesPassing, raccess);
        //     const rootType = floughTypeModule.createTypeFromLogicalObject(rootLogicalObject, rootNonObj);
        //     const sciPassing = copyRefTypesSymtabConstraintItem(sciFinal);
        //     sciPassing.symtab!.set(symbol,rootType);
        //     const typePassing = floughTypeModule.unionOfRefTypesType(critTypesPassing.filter(x=>x) as FloughType[]);
        //     unmerged.push({ type:typePassing, sci:sciPassing, critsense: "passing" });
        // }
        // if (critTypesFailing) {
        //     const { rootLogicalObject, rootNonObj} = floughLogicalObjectModule.logicalObjectModify(critTypesFailing, raccess);
        //     const rootType = floughTypeModule.createTypeFromLogicalObject(rootLogicalObject, rootNonObj);
        //     const sciFailing = copyRefTypesSymtabConstraintItem(sciFinal);
        //     sciFailing.symtab!.set(symbol,rootType);
        //     const typeFailing = floughTypeModule.unionOfRefTypesType(critTypesFailing.filter(x=>x) as FloughType[]);
        //     unmerged.push({ type:typeFailing, sci:sciFailing, critsense: "failing" });
        // }
    }

    export function resolveLogicalObjectAccessData(load: LogicalObjecAccessData, sc: RefTypesSymtabConstraintItem, type: FloughType):
    { type: FloughType, sc: RefTypesSymtabConstraintItem } {
        if (!useAlwaysProperyAccessCritNone) Debug.fail("unexpected");

        let typeOut = type;
        let scOut = sc;
        const loar = load.logicalObjectAccessReturn;
        const symbol = logicalObjectAccessModule.getSymbol(loar);
        if (symbol){
            const objType = logicalObjectAccessModule.modifyOne(
                loar, load.finalTypeIdx, type);
            if (!floughTypeModule.isNeverType(objType)) {
                scOut = copyRefTypesSymtabConstraintItem(sc);
                scOut.symtab!.set(symbol, objType);
            }
            else {
                // URGENT TODO: this should be "never" not "do nothing"
                typeOut = floughTypeModule.getNeverType();
                scOut = createRefTypesSymtabConstraintItemNever();
            }

        }
        else {
            // URGENT TODO: this should be "do nothing" not "never"
            // typeOut = floughTypeModule.getNeverType();
            // scOut = createRefTypesSymtabConstraintItemNever();
        }
        return { type: typeOut, sc: scOut };
    };

    export function resolveCallExpressionData(cad: CallExpressionData, sc: RefTypesSymtabConstraintItem, type: FloughType):
    { type: FloughType, sc: RefTypesSymtabConstraintItem } {
        if (!useFloughByCallExpressionV3) Debug.fail("unexpected");
        const typeOut = type;
        let scOut = sc;
        const load = cad.logicalObjectAccessData;
        const loar = load.logicalObjectAccessReturn;
        const symbol = logicalObjectAccessModule.getSymbol(loar);
        if (symbol){
            const callUndefinedAllowed = floughTypeModule.hasUndefinedType(type) && logicalObjectAccessModule.getFinalCarriedQdotUndefined(loar,load.finalTypeIdx);
            const objType = logicalObjectAccessModule.modifyOne(
                loar, load.finalTypeIdx, cad.functionTsType, callUndefinedAllowed);
            if (!floughTypeModule.isNeverType(objType)) {
                scOut = copyRefTypesSymtabConstraintItem(sc);
                scOut.symtab!.set(symbol, objType);
            };
        }
        return { type: typeOut, sc: scOut };
    }



    export function applyCrit(x: Readonly<FloughReturn>, crit: Readonly<InferCrit>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (useAlwaysProperyAccessCritNone){
            if (x.forCrit && x.forCrit.callExpressionResult){
                return applyCritV2(x,crit,nodeToTypeMap);
            }
            return applyCrit1(x.unmerged, crit, x.nodeForMap, nodeToTypeMap);

        }
        else {
            if (x.forCrit){
                return applyCritV2(x,crit,nodeToTypeMap);
            }
            return applyCrit1(x.unmerged, crit, x.nodeForMap, nodeToTypeMap);
        }
    }

    export function applyCrit1ToOne(rttr: Readonly<RefTypesTableReturn>, crit: Readonly<InferCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        Debug.assert(!crit.done);

        if (nodeToTypeMap) orIntoNodeToTypeMap(rttr.type,nodeForMap,nodeToTypeMap);
        if (floughTypeModule.isNeverType(rttr.type)){
            if (extraAsserts){
                Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            (crit as InferCrit).done = true; // note: overriding readonly
            return {
                passing: createNever(),
                failing: createNever(),
            };
        }
        if (extraAsserts){
            Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
        }
        let passtype = floughTypeModule.createRefTypesType();
        let failtype = crit.alsoFailing ? floughTypeModule.createRefTypesType() : undefined;
        applyCritToTypeMutate(rttr.type,crit,passtype,failtype);
        let passsc = rttr.sci;
        let failsc = crit.alsoFailing ? rttr.sci : undefined;
        if (rttr.symbol){
            ({type:passtype,sc:passsc} = andSymbolTypeIntoSymtabConstraint({
                symbol: rttr.symbol,
                type: passtype,
                isconst: rttr.isconst,
                isAssign: rttr.isAssign,
                sc: passsc,
                getDeclaredType,
                mrNarrow,
            }));
            if (crit.alsoFailing){
                ({type:failtype,sc:failsc} = andSymbolTypeIntoSymtabConstraint({
                    symbol: rttr.symbol,
                    type: failtype!,
                    isconst: rttr.isconst,
                    isAssign: rttr.isAssign,
                    sc: failsc!,
                    getDeclaredType,
                    mrNarrow,
                }));
            }
        }
        let passing: RefTypesTableReturnNoSymbol;
        let failing: RefTypesTableReturnNoSymbol | undefined;

        // const doLogicalObjectAccessData = (load: LogicalObjecAccessData, sc: RefTypesSymtabConstraintItem, type: FloughType): { type: FloughType, sc: RefTypesSymtabConstraintItem } => {
        //     if (!useAlwaysProperyAccessCritNone) Debug.fail("unexpected");

        //     let typeOut = type;
        //     let scOut = sc;
        //     const loar = load.logicalObjectAccessReturn;
        //     const symbol = logicalObjectAccessModule.getSymbol(loar);
        //     if (symbol){
        //         const objType = logicalObjectAccessModule.modifyOne(
        //             loar, load.finalTypeIdx, type);
        //         if (!floughTypeModule.isNeverType(objType)) {
        //             scOut = copyRefTypesSymtabConstraintItem(sc);
        //             scOut.symtab!.set(symbol, objType);
        //         };
        //     }
        //     else {
        //         typeOut = floughTypeModule.getNeverType();
        //         scOut = createRefTypesSymtabConstraintItemNever();
        //     }
        //     (crit as InferCrit).done = true; // note: overriding readonly
        //     return { type: typeOut, sc: scOut };
        // };



        if (floughTypeModule.isNeverType(passtype)) passing = createNever();
        else {
            if (useAlwaysProperyAccessCritNone){
                if (useFloughByCallExpressionV3){
                    if (rttr.callExpressionData){
                        Debug.assert(!rttr.logicalObjectAccessData);
                        ({type: passtype, sc: passsc} = resolveCallExpressionData(rttr.callExpressionData, passsc, passtype));
                    }
                }
                if (rttr.logicalObjectAccessData){
                    ({type: passtype, sc: passsc} = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, passsc, passtype));
                }
            }
            passing = {
                type: passtype,
                sci: passsc
            };
        }
        if (crit.alsoFailing && floughTypeModule.isNeverType(failtype!)) failing = createNever();
        else if (crit.alsoFailing){
            if (useAlwaysProperyAccessCritNone){
                if (useFloughByCallExpressionV3){
                    if (rttr.callExpressionData){
                        Debug.assert(!rttr.logicalObjectAccessData);
                        ({type: failtype, sc: failsc} = resolveCallExpressionData(rttr.callExpressionData, failsc!, failtype!));
                    }
                }
                if (rttr.logicalObjectAccessData){
                    ({type: failtype, sc: failsc} = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, failsc!, failtype!));
                }
            }
            failing = {
                type: failtype!,
                sci: failsc!
            };
        }
        // if (nodeToTypeMap) orIntoNodeToTypeMap(floughTypeModule.unionOfRefTypesType([passing.type,failing.type]),nodeForMap,nodeToTypeMap);
        (crit as InferCrit).done = true; // note: overriding readonly
        return { passing,failing };
    }


    export function applyCrit1(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (arrRttr.length===0) return { passing: createNever(), failing: crit.alsoFailing? createNever() : undefined };
        if (arrRttr.length===1) {
            Debug.assert(!arrRttr[0].critsense);
            return applyCrit1ToOne(arrRttr[0],crit,nodeForMap,nodeToTypeMap);
        }
        if (arrRttr.length===2 && (arrRttr[0].critsense || arrRttr[1].critsense)){
            if (extraAsserts){
                Debug.assert(arrRttr[0].critsense==="passing" && arrRttr[1].critsense==="failing");
            }
            const passing = applyCritNoneToOne(arrRttr[0],nodeForMap,nodeToTypeMap);
            const failing = applyCritNoneToOne(arrRttr[1],nodeForMap,nodeToTypeMap);
            return { passing,failing };
        }
        const arrPassType: RefTypesType[]=[];
        const arrFailType: RefTypesType[]=[];
        const arrPassSC: RefTypesSymtabConstraintItemNotNever[]=[];
        const arrFailSC: RefTypesSymtabConstraintItemNotNever[]=[];
        arrRttr.forEach(rttr=>{
            if (floughTypeModule.isNeverType(rttr.type)){
                if (extraAsserts){
                    Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                return;
            }
            if (extraAsserts){
                Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            let passtype = floughTypeModule.createRefTypesType();
            let failtype = crit.alsoFailing ? floughTypeModule.createRefTypesType() : undefined;
            applyCritToTypeMutate(rttr.type,crit,passtype,failtype);
            if (!floughTypeModule.isNeverType(passtype)){
                let passsc = rttr.sci;
                if (rttr.symbol){
                    ({type:passtype,sc:passsc} = andSymbolTypeIntoSymtabConstraint({
                        symbol: rttr.symbol,
                        type: passtype,
                        isconst: rttr.isconst,
                        isAssign: rttr.isAssign,
                        sc: passsc,
                        getDeclaredType,
                        mrNarrow,
                    }));
                }
                if (useAlwaysProperyAccessCritNone){
                    if (useFloughByCallExpressionV3){
                        if (rttr.callExpressionData){
                            Debug.assert(!rttr.logicalObjectAccessData);
                            ({type: passtype, sc: passsc} = resolveCallExpressionData(rttr.callExpressionData, passsc, passtype));
                        }
                    }
                    if (rttr.logicalObjectAccessData){
                        ({type: passtype, sc: passsc} = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, passsc, passtype));
                    }
                }
                if (!floughTypeModule.isNeverType(passtype)){
                    arrPassType.push(passtype);
                    arrPassSC.push(passsc as RefTypesSymtabConstraintItemNotNever);
                }
            }
            if (crit.alsoFailing){
                if (!floughTypeModule.isNeverType(failtype!)){
                    let failsc = rttr.sci;
                    if (rttr.symbol){
                        ({type:failtype,sc:failsc} = andSymbolTypeIntoSymtabConstraint({
                            symbol: rttr.symbol,
                            type: failtype!,
                            isconst: rttr.isconst,
                            isAssign: rttr.isAssign,
                            sc: failsc,
                            getDeclaredType,
                            mrNarrow,
                        }));
                    }
                    if (useAlwaysProperyAccessCritNone){
                        if (useFloughByCallExpressionV3){
                            if (rttr.callExpressionData){
                                Debug.assert(!rttr.logicalObjectAccessData);
                                ({type: failtype, sc: failsc} = resolveCallExpressionData(rttr.callExpressionData, failsc, failtype!));
                            }
                        }
                             if (rttr.logicalObjectAccessData){
                            ({type: failtype, sc: failsc} = resolveLogicalObjectAccessData(rttr.logicalObjectAccessData, failsc, failtype!));
                        }
                    }
                    if (!floughTypeModule.isNeverType(failtype!)){
                        arrFailType.push(failtype!);
                        arrFailSC.push(failsc as RefTypesSymtabConstraintItemNotNever);
                    }
                }
            }
        });
        let passing: RefTypesTableReturnNoSymbol;
        let failing: RefTypesTableReturnNoSymbol | undefined;
        if (arrPassType.length===0) passing = createNever();
        else {
            passing = {
                type: floughTypeModule.unionOfRefTypesType(arrPassType),
                sci: orSymtabConstraints(arrPassSC/*,mrNarrow*/)
            };
        }
        if (crit.alsoFailing) {
            if (arrFailType.length===0) failing = createNever();
            else {
                failing = {
                    type: floughTypeModule.unionOfRefTypesType(arrFailType),
                    sci: orSymtabConstraints(arrFailSC/*,mrNarrow*/)
                };
            }
        }
        if (nodeToTypeMap) {
            const typeForNodeMap = failing ? floughTypeModule.unionOfRefTypesType([passing.type,failing.type]) : passing.type;
            orIntoNodeToTypeMap(typeForNodeMap, nodeForMap, nodeToTypeMap);
        }
        return { passing,failing };
    }

}
