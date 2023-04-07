namespace ts {
    const checker: TypeChecker = undefined as any as TypeChecker;
    const getDeclaredType: GetDeclaredTypeFn = undefined as any as GetDeclaredTypeFn;
    const mrNarrow: MrNarrow = undefined as any as MrNarrow;

    export function initFlowGroupInferApplyCrit(checkerIn: TypeChecker, mrNarrowIn: MrNarrow): void {
        (checker as any) = checkerIn;
        (mrNarrow as any) = mrNarrowIn;
        (getDeclaredType as any) = mrNarrowIn.getDeclaredType;
    }

    export function createNeverRefTypesTableReturn(): RefTypesTableReturnNoSymbol {
        return {
            kind: RefTypesTableKind.return,
            type: mrNarrow.createRefTypesType(),
            sci: createRefTypesSymtabConstraintItemNever()
        };
    }

    function applyCritToType(rt: Readonly<RefTypesType>,crit: Readonly<InferCrit>, passtype: RefTypesType, failtype?: RefTypesType): void {
        Debug.assert(crit.kind!==InferCritKind.none);
        const forEachRefTypesTypeType = mrNarrow.refTypesTypeModule.forEachRefTypesTypeType;
        const addTsTypeNonUnionToRefTypesTypeMutate = mrNarrow.refTypesTypeModule.addTsTypeNonUnionToRefTypesTypeMutate;
        if (crit.kind===InferCritKind.truthy) {
            if (crit.alsoFailing){
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    if (tf&pfacts) addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                    if (tf&ffacts) addTsTypeNonUnionToRefTypesTypeMutate(t,failtype!);
                });
            }
            else {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    if (tf&pfacts) addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                });
            }
        }
        else if (crit.kind===InferCritKind.notnullundef) {
            const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
            const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
            forEachRefTypesTypeType(rt, t => {
                const tf = checker.getTypeFacts(t);
                if (tf&pfacts) addTsTypeNonUnionToRefTypesTypeMutate(t,passtype);
                if (failtype && tf&ffacts) addTsTypeNonUnionToRefTypesTypeMutate(t,failtype);
    });
        }
        else if (crit.kind===InferCritKind.assignable) {
            const assignableRelation = checker.getRelations().assignableRelation;
            forEachRefTypesTypeType(rt, source => {
                let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                if (crit.negate) rel = !rel;
                if (rel) addTsTypeNonUnionToRefTypesTypeMutate(source, passtype);
                else if (failtype) addTsTypeNonUnionToRefTypesTypeMutate(source, failtype);
            });
        }
        else {
            // @ts-ignore
            Debug.fail("unexpected ", ()=>crit.kind);
        }
    }

    export function applyCritNoneToOne(rttr: Readonly<RefTypesTableReturn>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        if (!rttr.symbol){
            nodeToTypeMap?.set(nodeForMap,mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(rttr.type));
            return rttr;
        }
        const {type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, sc:rttr.sci,
            mrNarrow, getDeclaredType});
        nodeToTypeMap?.set(nodeForMap,mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(type));
        return {
            kind: RefTypesTableKind.return,
            type,
            sci: sc
        };
    }

    export function applyCritNoneUnion(x: Readonly<MrNarrowTypesReturn>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        return applyCritNone1Union(x.inferRefRtnType.unmerged, x.nodeForMap, nodeToTypeMap);
    }
    export function applyCritNone1Union(arrRttr: Readonly<RefTypesTableReturn[]>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): RefTypesTableReturnNoSymbol {
        if (arrRttr.length===0) return createNeverRefTypesTableReturn();
        if (arrRttr.length===1) return applyCritNoneToOne(arrRttr[0],nodeForMap,nodeToTypeMap);
        // if (arrRttr.length===1) {
        //     const rttr = arrRttr[0];
        //     if (!rttr.symbol) return rttr;
        //     const {type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, sc:rttr.sci,
        //         mrNarrow, getDeclaredType});
        //     nodeToTypeMap?.set(nodeForMap,mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(type));
        //     return {
        //         kind: RefTypesTableKind.return,
        //         type,
        //         sci: sc
        //     };
        // }

        const atype: RefTypesType[] = [];
        const asc: RefTypesSymtabConstraintItem[] = [];

        arrRttr.forEach(rttr=>{
            let type: RefTypesType;
            let sc: RefTypesSymtabConstraintItem;
            if (rttr.symbol){
                ({type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, getDeclaredType,
                    sc:rttr.sci, mrNarrow}));
                if (mrNarrow.isNeverType(type)) return;
                if (extraAsserts){
                    Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
                }
                atype.push(type);
                asc.push(sc);
            }
            else {
                if (mrNarrow.isNeverType(rttr.type)) return;
                if (extraAsserts){
                    Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                atype.push(rttr.type);
                asc.push(rttr.sci);
            }
        });
        const type = mrNarrow.unionOfRefTypesType(atype);
        nodeToTypeMap?.set(nodeForMap,mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(type));
        const sci = orSymtabConstraints(asc,mrNarrow);
        return {
            kind: RefTypesTableKind.return,
            type, sci
        };
    }

    export type ApplyCritResult = & { passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined };
    export function applyCrit(x: Readonly<MrNarrowTypesReturn>, crit: Readonly<InferCrit>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        return applyCrit1(x.inferRefRtnType.unmerged, crit, x.nodeForMap, nodeToTypeMap);
    }
    export function applyCrit1(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (arrRttr.length===0) return { passing: createNeverRefTypesTableReturn(), failing: crit.alsoFailing? createNeverRefTypesTableReturn() : undefined };
        if (arrRttr.length===1) {
            const rttr = arrRttr[0];
            if (mrNarrow.isNeverType(rttr.type)){
                if (extraAsserts){
                    Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                return {
                    passing: createNeverRefTypesTableReturn(),
                    failing: createNeverRefTypesTableReturn(),
                };
            }
            if (extraAsserts){
                Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            let passtype = mrNarrow.createRefTypesType();
            let failtype = crit.alsoFailing ? mrNarrow.createRefTypesType() : undefined;
            applyCritToType(rttr.type,crit,passtype,failtype);
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
            let failing: RefTypesTableReturnNoSymbol;
            if (mrNarrow.isNeverType(passtype)) passing = createNeverRefTypesTableReturn();
            else {
                passing = {
                    kind: RefTypesTableKind.return,
                    type: passtype,
                    sci: passsc
                };
            }
            if (crit.alsoFailing && mrNarrow.isNeverType(failtype!)) failing = createNeverRefTypesTableReturn();
            else {
                failing = {
                    kind: RefTypesTableKind.return,
                    type: failtype!,
                    sci: failsc!
                };
            }
            nodeToTypeMap?.set(nodeForMap,
                mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(mrNarrow.refTypesTypeModule.unionOfRefTypesType([passing.type,failing.type])));
            return { passing,failing };
        }

        const arrPassType: RefTypesType[]=[];
        const arrFailType: RefTypesType[]=[];
        const arrPassSC: RefTypesSymtabConstraintItemNotNever[]=[];
        const arrFailSC: RefTypesSymtabConstraintItemNotNever[]=[];
        arrRttr.forEach(rttr=>{
            if (mrNarrow.isNeverType(rttr.type)){
                if (extraAsserts){
                    Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
                }
                return;
            }
            if (extraAsserts){
                Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
            let passtype = mrNarrow.createRefTypesType();
            let failtype = crit.alsoFailing ? mrNarrow.createRefTypesType() : undefined;
            applyCritToType(rttr.type,crit,passtype,failtype);
            if (!mrNarrow.isNeverType(passtype)){
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
                if (!mrNarrow.isNeverType(passtype)){
                    arrPassType.push(passtype);
                    arrPassSC.push(passsc as RefTypesSymtabConstraintItemNotNever);
                }
            }
            if (crit.alsoFailing){
                if (!mrNarrow.isNeverType(failtype!)){
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
                    if (!mrNarrow.isNeverType(failtype!)){
                        arrFailType.push(failtype!);
                        arrFailSC.push(failsc as RefTypesSymtabConstraintItemNotNever);
                    }
                }
            }
        });
        let passing: RefTypesTableReturnNoSymbol;
        let failing: RefTypesTableReturnNoSymbol | undefined;
        if (arrPassType.length===0) passing = createNeverRefTypesTableReturn();
        else {
            passing = {
                kind: RefTypesTableKind.return,
                type: mrNarrow.unionOfRefTypesType(arrPassType),
                sci: orSymtabConstraints(arrPassSC,mrNarrow)
            };
        }
        if (crit.alsoFailing) {
            if (arrFailType.length===0) failing = createNeverRefTypesTableReturn();
            else {
                failing = {
                    kind: RefTypesTableKind.return,
                    type: mrNarrow.unionOfRefTypesType(arrFailType),
                    sci: orSymtabConstraints(arrFailSC,mrNarrow)
                };
            }
        }
        nodeToTypeMap?.set(nodeForMap,
            mrNarrow.refTypesTypeModule.getTypeFromRefTypesType(
                failing ? mrNarrow.refTypesTypeModule.unionOfRefTypesType([passing.type,failing.type]) : passing.type));
        return { passing,failing };
    }

}
