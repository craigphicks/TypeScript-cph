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

    function applyCritToType(rt: Readonly<RefTypesType>,crit: Readonly<InferCrit>, passtype: RefTypesType, failtype?: RefTypesType): void {
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

    function orIntoNodeToTypeMap(type: RefTypesType, node: Node, nodeToTypeMap: NodeToTypeMap){
        const tstype = floughTypeModule.getTypeFromRefTypesType(type);
        const got = nodeToTypeMap.get(node);
        if (!got) nodeToTypeMap.set(node,tstype);
        else nodeToTypeMap.set(node,checker.getUnionType([got,tstype],UnionReduction.Literal));
        if (getMyDebug()){
            consoleLog(`orIntoNodeToTypeMap(type:${floughTypeModule.dbgFloughTypeToString(type)},node:${dbgsModule.dbgNodeToString(node)})::`
                +`${got?dbgsModule.dbgTypeToString(got):"*"}->${dbgsModule.dbgTypeToString(nodeToTypeMap.get(node)!)}`);
        }
    }

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
        const sci = orSymtabConstraints(asc,mrNarrow);
        return {
            type, sci
        };
    }

    export function applyCrit(x: Readonly<FloughReturn>, crit: Readonly<InferCrit>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        return applyCrit1(x.unmerged, crit, x.nodeForMap, nodeToTypeMap);
    }

    export function applyCrit1ToOne(rttr: Readonly<RefTypesTableReturn>, crit: Readonly<InferCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (floughTypeModule.isNeverType(rttr.type)){
            if (extraAsserts){
                Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
            }
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
        if (floughTypeModule.isNeverType(passtype)) passing = createNever();
        else {
            passing = {
                type: passtype,
                sci: passsc
            };
        }
        if (crit.alsoFailing && floughTypeModule.isNeverType(failtype!)) failing = createNever();
        else {
            failing = {
                type: failtype!,
                sci: failsc!
            };
        }
        if (nodeToTypeMap) orIntoNodeToTypeMap(floughTypeModule.unionOfRefTypesType([passing.type,failing.type]),nodeForMap,nodeToTypeMap);
        return { passing,failing };
    }


    export function applyCrit1(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, nodeForMap: Readonly<Node>, nodeToTypeMap: NodeToTypeMap | undefined): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (arrRttr.length===0) return { passing: createNever(), failing: crit.alsoFailing? createNever() : undefined };
        if (arrRttr.length===1) return applyCrit1ToOne(arrRttr[0],crit,nodeForMap,nodeToTypeMap);
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
            applyCritToType(rttr.type,crit,passtype,failtype);
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
                sci: orSymtabConstraints(arrPassSC,mrNarrow)
            };
        }
        if (crit.alsoFailing) {
            if (arrFailType.length===0) failing = createNever();
            else {
                failing = {
                    type: floughTypeModule.unionOfRefTypesType(arrFailType),
                    sci: orSymtabConstraints(arrFailSC,mrNarrow)
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
