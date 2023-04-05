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

    export function applyCritNone(arrRttr: Readonly<RefTypesTableReturn[]>): RefTypesTableReturnNoSymbol {
        if (arrRttr.length===0) return createNever();
        if (arrRttr.length===1) {
            const rttr = arrRttr[0];
            if (!rttr.symbol) return rttr;
            const {type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,isAssign:rttr.isAssign,type:rttr.type, sc:rttr.sci,
                mrNarrow, getDeclaredType});
            return {
                kind: RefTypesTableKind.return,
                type,
                sci: sc
            };
        }

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
        const sci = orSymtabConstraints(asc,mrNarrow);
        return {
            kind: RefTypesTableKind.return,
            type, sci
        };
    }
    // type ApplyCritReturnType = & {
    //     passing: RefTypesTableReturnNoSymbol,
    //     failing?: RefTypesTableReturnNoSymbol | undefined
    // };
    export function applyCrit(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>): {
        passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol | undefined
    } {
        if (arrRttr.length===0) return { passing: createNever(), failing: crit.alsoFailing? createNever() : undefined };
        if (arrRttr.length===1) {
            const rttr = arrRttr[0];
            if (mrNarrow.isNeverType(rttr.type)){
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
            if (mrNarrow.isNeverType(passtype)) passing = createNever();
            else {
                passing = {
                    kind: RefTypesTableKind.return,
                    type: passtype,
                    sci: passsc
                };
            }
            if (crit.alsoFailing && mrNarrow.isNeverType(failtype!)) failing = createNever();
            else {
                failing = {
                    kind: RefTypesTableKind.return,
                    type: failtype!,
                    sci: failsc!
                };
            }
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
        if (arrPassType.length===0) passing = createNever();
        else {
            passing = {
                kind: RefTypesTableKind.return,
                type: mrNarrow.unionOfRefTypesType(arrPassType),
                sci: orSymtabConstraints(arrPassSC,mrNarrow)
            };
        }
        if (crit.alsoFailing) {
            if (arrFailType.length===0) failing = createNever();
            else {
                failing = {
                    kind: RefTypesTableKind.return,
                    type: mrNarrow.unionOfRefTypesType(arrFailType),
                    sci: orSymtabConstraints(arrFailSC,mrNarrow)
                };
            }
        }
        return { passing,failing };
    }

}
