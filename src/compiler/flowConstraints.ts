/* eslint-disable no-null/no-null */
namespace ts {


    // @ ts-expect-error
    export type GetDeclaredTypeFn = (symbol: Symbol) => RefTypesType;

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected");
        const c: ConstraintItemNodeAnd = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: (ConstraintItem)[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected");
        const c: ConstraintItemNodeOr = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.or,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeNot(constraint: ConstraintItem): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.not,
            constraint
        };
    }
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType): ConstraintItemLeaf {
        return {
            kind: ConstraintItemKind.leaf,
            symbol, type,
            symbolsInvolved: new Set<Symbol>([symbol])
        };
    }
    export function createFlowConstraintNever(): ConstraintItemNever {
        return { kind:ConstraintItemKind.never };
    }

    // @ts-ignore
    export function isNeverConstraint(c: ConstraintItem): c is ConstraintItemNever {
        return (c.kind===ConstraintItemKind.never);
    }
    export function isNotNeverConstraint(c: ConstraintItem): c is ConstraintItemNotNever {
        return (c.kind!==ConstraintItemKind.never);
    }
    export function createFlowConstraintAlways(): ConstraintItemAlways {
        return { kind:ConstraintItemKind.always, symbolsInvolved: new Set<Symbol>() };
    }
    // @ts-ignore
    export function isAlwaysConstraint(c: ConstraintItem): boolean {
        return (c.kind===ConstraintItemKind.always);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // @ts-expect-error
    function copyConstraintItem(ci: Readonly<ConstraintItem>, mrNarrow: MrNarrow): ConstraintItem {
        switch (ci.kind){
            case ConstraintItemKind.always:
            case ConstraintItemKind.never:
                return { ...ci };
            case ConstraintItemKind.leaf:
                return { ...ci, type: floughTypeModule.cloneRefTypesType(ci.type) };
            case ConstraintItemKind.node:{
                const symbolsInvolved = ci.symbolsInvolved ? new Set<Symbol>(ci.symbolsInvolved) : undefined;
                if (ci.op===ConstraintItemNodeOp.not){
                    return {
                        ...ci,
                        symbolsInvolved,
                        constraint: copyConstraintItem(ci.constraint, mrNarrow)
                    };
                }
                else {
                    return {
                        ...ci,
                        symbolsInvolved,
                        constraints: ci.constraints.map(ci1=>copyConstraintItem(ci1,mrNarrow))
                    };
                }
            }
        }
    }

    // export function copySymtabConstraint(sc: Readonly<RefTypesSymtabConstraintItem>, mrNarrow: MrNarrow): RefTypesSymtabConstraintItem {
    //     const symtab = mrNarrow.copyRefTypesSymtab(sc.symtab);
    //     const constraintItem = copyConstraintItem(sc.constraintItem, mrNarrow);
    //     return { symtab,constraintItem };
    // }

    // Revive for testing, comparing with evalCover.
    export function evalTypeOverConstraint({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (getMyDebug()){
            const as: string[] = [];
            consoleGroup(`evalTypeOverConstraint[in][${depth}]`);
            floughTypeModule.dbgRefTypesTypeToStrings(typeRange).forEach(s=>as.push(`evalTypeOverConstraint[in][${depth}]: symbol:${symbol.escapedName}, negate:${negate}, typeRange: ${s}`));
            //as.push(`evalTypeOverConstraint[in][${depth}]: depth:${depth}, symbol:${symbol.escapedName}, negate:${negate}, typeRange: ${floughTypeModule.dbgRefTypesTypeToString(typeRange)}.`);
            if (!cin) as.push(`evalTypeOverConstraint[in][${depth}]: constraint: undefined`);
            else mrNarrow.dbgConstraintItem(cin).forEach(s=>as.push(`evalTypeOverConstraint[in][${depth}]: constraint: ${s}`));
            as.forEach(s=>consoleLog(s));
        }
        const r = evalTypeOverConstraint_aux({ cin, symbol, typeRange, negate, mrNarrow, depth });
        if (getMyDebug()){
            floughTypeModule.dbgRefTypesTypeToStrings(r).forEach(s=>consoleLog(`evalTypeOverConstraint[out][${depth}] type: ${s}`));
            //consoleLog(`evalTypeOverConstraint[out][${depth}]: ${floughTypeModule.dbgRefTypesTypeToString(r)}`);
            consoleGroupEnd();
        }
        return r;
    }

    function evalTypeOverConstraint_aux({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (floughTypeModule.isNeverType(typeRange)){
            return typeRange;
        }
        if (floughTypeModule.isAnyType(typeRange) || floughTypeModule.isUnknownType(typeRange)){
            typeRange = floughTypeModule.createRefTypesType(mrNarrow.checker.getAnyType());
        }

        if (cin.kind===ConstraintItemKind.always) return !negate ? typeRange : floughTypeModule.createRefTypesType();
        if (cin.kind===ConstraintItemKind.never){
            if (!negate) return floughTypeModule.createRefTypesType(); // never
            return typeRange;
        }
        if (cin.kind===ConstraintItemKind.leaf){
            if (!negate){
                if (cin.symbol!==symbol) return typeRange;
                return floughTypeModule.intersectionOfRefTypesType(cin.type,typeRange);
            }
            else {
                if (cin.symbol!==symbol) return floughTypeModule.createRefTypesType(); // never
                return floughTypeModule.subtractFromType(cin.type,typeRange);
            }
        }
        else if (cin.kind===ConstraintItemKind.node){
            if (cin.op===ConstraintItemNodeOp.not){
                return evalTypeOverConstraint({ cin:cin.constraint, symbol, typeRange, negate:!negate, mrNarrow, depth:depth+1 });
            }
            if (cin.op===ConstraintItemNodeOp.and && !negate || cin.op===ConstraintItemNodeOp.or && negate){
                let isectType = typeRange;
                for (const subc of cin.constraints){
                    const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange:isectType, mrNarrow, depth:depth+1 });
                    if (floughTypeModule.isNeverType(subType)) return subType;
                    if (subType!==isectType && !floughTypeModule.isASubsetOfB(isectType,subType)) isectType=subType;
                }
                return isectType;
            }
            if (cin.op===ConstraintItemNodeOp.or && !negate || cin.op===ConstraintItemNodeOp.and && negate){
                const unionType = floughTypeModule.createRefTypesType(); // never
                for (const subc of cin.constraints){
                    const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange, mrNarrow, depth:depth+1 });
                    floughTypeModule.mergeToRefTypesType({ source:subType, target:unionType });
                    if (floughTypeModule.isASubsetOfB(typeRange,unionType)) return typeRange;
                }
                return unionType;
            }
        }
        Debug.fail("unexpected");
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * A possibly simplifying transformation
     * The following identities hold:
     * A(BC) = A ((AB)/A(AC)/A)
     * A(B+C) = A ((AB)/A)+(AC)/A)
     * A!(BC) = A (A!B/A + A!C/A)
     * A!(B+C) = A (A!B/A)(A!C/A)
     * Therefore this andDistributeDivide function prepares for a top level "and" using the following tranforms.
     * (BC) => ((AB)/A)(AC)/A)
     * (B+C) => ((AB)/A+(AC)/A)
     * !(BC) => (A!B/A + A!C/A)
     * !(B+C) => (A!B)/A(A!C)/A
     */
    export function andDistributeDivide({
        symbol, type, declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType?: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, getDeclaredType: GetDeclaredTypeFn,
            mrNarrow: MrNarrow, refCountIn?: [number], refCountOut?: [number], depth?: number
    }): ConstraintItem {
        if (!refCountIn) refCountIn=[0];
        if (!refCountOut) refCountOut=[0];
        if (!declaredType) declaredType = getDeclaredType(symbol);
        const doLog = false;
        if (doLog && getMyDebug()){
            floughTypeModule.dbgRefTypesTypeToStrings(type).forEach(s=>consoleLog(`andDistributeDivide[in][${depth??0}] type: ${s}`));
            //consoleGroup(`andDistributeDivide[in][${depth??0}] symbol:${symbol.escapedName}, type: ${floughTypeModule.dbgRefTypesTypeToString(type)}, typeRange: ${floughTypeModule.dbgRefTypesTypeToString(declaredType)}, negate: ${negate??false}}, countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(cin).forEach(s=>{
                consoleLog(`andDistributeDivide[in][${depth??0}] constraint: ${s}`);
            });
        }
        const creturn = andDistributeDivideAux({ symbol, type, declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth });
        if (doLog && getMyDebug()){
            consoleLog(`andDistributeDivide[out][${depth??0}] countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(creturn).forEach(s=>{
                consoleLog(`andDistributeDivide[out][${depth??0}] constraint: ${s}`);
            });
            consoleGroupEnd();
        }
        return creturn;
    }
    function andDistributeDivideAux({
        symbol, type, declaredType: declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, getDeclaredType: GetDeclaredTypeFn,
            mrNarrow: MrNarrow, refCountIn: [number], refCountOut: [number], depth?: number
    }): ConstraintItem {
        if (floughTypeModule.isAnyType(type)) {
            return cin;
        }
        if (floughTypeModule.isUnknownType(type)) {
            return cin;
        }
        depth = depth??0;
        refCountIn[0]++;
        refCountOut[0]++;
        //if (floughTypeModule.isNeverType(type)) return createFlowConstraintNever(); don't want this because pass never to remove symbols and their products
        if (floughTypeModule.isASubsetOfB(declaredType,type)) {
            // Bug fix with ConstraintsV2
            // keep on going, (could also just return cin?).
            //return createFlowConstraintAlways();
        }
        if ((cin.kind===ConstraintItemKind.never && !negate) || (cin.kind===ConstraintItemKind.always && negate)) return createFlowConstraintNever();
        if ((cin.kind===ConstraintItemKind.never && negate) || (cin.kind===ConstraintItemKind.always && !negate)) return createFlowConstraintAlways();
        if (cin.kind===ConstraintItemKind.leaf){
            if (symbol===cin.symbol){
                if (floughTypeModule.isNeverType(cin.type)) Debug.fail("unexpected");
                if (floughTypeModule.isAnyType(cin.type)) Debug.fail("not yet implemented");
                if (floughTypeModule.isUnknownType(cin.type)) Debug.fail("not yet implemented");
            }
            if (!negate) {
                if (symbol!==cin.symbol) {
                    return cin; //createFlowConstraintLeaf(cin.symbol, cin.type);
                }
                else {
                    // @ ts-expect-error
                    const isectType = floughTypeModule.intersectionOfRefTypesType(cin.type, type);
                    if (floughTypeModule.isNeverType(isectType)) return createFlowConstraintNever();
                    if (!floughTypeModule.isASubsetOfB(type,isectType)) return createFlowConstraintLeaf(symbol,isectType);
                    return createFlowConstraintAlways();
                }
            }
            else {
                if (symbol!==cin.symbol) {
                    refCountOut[0]++;
                    return createFlowConstraintNodeNot(cin);
                }
                else {
                    const isectInvType = floughTypeModule.intersectionOfRefTypesType(floughTypeModule.subtractFromType(cin.type, declaredType), type);
                    if (floughTypeModule.isNeverType(isectInvType)) return createFlowConstraintNever();
                    if (!floughTypeModule.isASubsetOfB(type,isectInvType)) return createFlowConstraintLeaf(symbol,isectInvType);
                    return createFlowConstraintAlways();
                }
            }
        }
        else {
            if (cin.kind!==ConstraintItemKind.node) Debug.fail("unexpected");
            if (cin.op===ConstraintItemNodeOp.not){
                return andDistributeDivide({ symbol, type, declaredType, cin:cin.constraint, negate:!negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
            }
            else if ((cin.op===ConstraintItemNodeOp.and && !negate) || (cin.op===ConstraintItemNodeOp.or && negate)){
                const constraints: (ConstraintItem)[]=[];
                const mapSymbolLeafs = new Map<Symbol, Set<ConstraintItemLeaf>>(); // for gathering same symbol leafs
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (isAlwaysConstraint(subcr)) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]-=(constraints.length-1);
                        return subcr;
                    }
                    if (subcr.kind===ConstraintItemKind.leaf){
                        const got = mapSymbolLeafs.get(subcr.symbol);
                        if (!got) mapSymbolLeafs.set(subcr.symbol, new Set<ConstraintItemLeaf>([subcr]));
                        else got.add(subcr);
                        continue;
                    }
                    constraints.push(subcr);
                }
                let hasNeverLeaf = false;
                mapSymbolLeafs.forEach((setc,csymbol)=>{
                    if (setc.size===1) constraints.push(setc.values().next().value as ConstraintItem);
                    else {
                        const atype: RefTypesType[] = [];
                        setc.forEach(cleaf=>atype.push(cleaf.type));
                        const ctype = floughTypeModule.intersectionOfRefTypesType(...atype);
                        if (floughTypeModule.isNeverType(ctype)) hasNeverLeaf = true;
                        constraints.push({ kind:ConstraintItemKind.leaf,symbol:csymbol,type:ctype });
                    }
                });
                if (hasNeverLeaf) return createFlowConstraintNever();
                if (constraints.length===0) return createFlowConstraintAlways();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeAnd({ constraints });
            }
            else if ((cin.op===ConstraintItemNodeOp.or && !negate) || (cin.op===ConstraintItemNodeOp.and && negate)){
                const constraints: (ConstraintItem)[]=[];
                const mapSymbolLeafs = new Map<Symbol, Set<ConstraintItemLeaf>>(); // for gathering same symbol leafs
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (isAlwaysConstraint(subcr)) {
                        refCountOut[0]-=(constraints.length-1);
                        return createFlowConstraintAlways();
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (subcr.kind===ConstraintItemKind.leaf){
                        const got = mapSymbolLeafs.get(subcr.symbol);
                        if (!got) mapSymbolLeafs.set(subcr.symbol, new Set<ConstraintItemLeaf>([subcr]));
                        else got.add(subcr);
                        continue;
                    }
                    constraints.push(subcr);
                }
                let hasAlwaysLeaf = false;
                mapSymbolLeafs.forEach((setc,csymbol)=>{
                    if (setc.size===1) constraints.push(setc.values().next().value as ConstraintItem);
                    else {
                        const atype: RefTypesType[] = [];
                        setc.forEach(cleaf=>atype.push(cleaf.type));
                        const ctype = floughTypeModule.unionOfRefTypesType(atype);
                        const cdeclType = getDeclaredType(csymbol);
                        if (floughTypeModule.isASubsetOfB(cdeclType,ctype)) hasAlwaysLeaf = true;
                        constraints.push({ kind:ConstraintItemKind.leaf,symbol:csymbol,type:ctype });
                    }
                });
                if (hasAlwaysLeaf) return createFlowConstraintAlways();
                if (constraints.length===0) return createFlowConstraintNever();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeOr({ constraints });
            }
            Debug.fail("unexpected");
        }
    }

    function andIntoConstraintShallow({symbol, type, constraintItem}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem}): ConstraintItem {
        if (floughTypeModule.isNeverType(type)) return createFlowConstraintNever();
        if (constraintItem.kind===ConstraintItemKind.always){
            return { kind: ConstraintItemKind.leaf, symbol, type };
        }
        if (constraintItem.kind===ConstraintItemKind.never) return constraintItem;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol===symbol){
                const isecttype = floughTypeModule.intersectionOfRefTypesType(type, constraintItem.type);
                if (floughTypeModule.isNeverType(isecttype)) return createFlowConstraintNever();
                return createFlowConstraintLeaf(symbol, isecttype);
            }
            return {
                kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints:[
                    { kind: ConstraintItemKind.leaf, symbol, type },
                    constraintItem
            ]};
        }
        else if (constraintItem.kind===ConstraintItemKind.node){
            if (constraintItem.op===ConstraintItemNodeOp.not || constraintItem.op===ConstraintItemNodeOp.or) {
                return {
                    kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                        { kind: ConstraintItemKind.leaf, symbol, type },
                        constraintItem
                ]};
            }
            else if (constraintItem.op===ConstraintItemNodeOp.and){
                return {
                    kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                    ...constraintItem.constraints, { kind: ConstraintItemKind.leaf, symbol, type }
                ]};
            }
        }
        Debug.fail("unexpected");
    }
    function orIntoConstraintsShallow(acin: Readonly<(ConstraintItem)[]>): ConstraintItem {
        const ac: ConstraintItem[]=[];
        for (const c of acin){
            if (isAlwaysConstraint(c)) return createFlowConstraintAlways();;
            if (!isNeverConstraint(c)) ac.push(c);
        }
        if (ac.length===0) return createFlowConstraintNever();
        if (ac.length===1) return ac[0];
        return createFlowConstraintNodeOr({ constraints:ac });
    }
    function orSymtabConstraintsV2(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow): RefTypesSymtabConstraintItem{
        if (asc.length===0) Debug.fail("unexpected"); //return { symtab: createRefTypesSymtab(), constraintItem: createFlowConstraintNever() };
        if (asc.length===1) return asc[0];
        const asc1 = asc.filter(sc=>!isNeverConstraint(sc.constraintItem));
        if (asc1.length===0) return createRefTypesSymtabConstraintItemNever(); // assuming or of nevers is never
        if (asc1.length===1) return asc1[0];
        const unionSymtab = mrNarrow.unionArrRefTypesSymtab((asc as RefTypesSymtabConstraintItemNotNever[]).map(x=>x.symtab));
        const oredConstraint = createFlowConstraintAlways(); // orConstraints(asc.map(x=>x.constraintItem));
        // const symbolsInvolved = new Set<Symbol>();
        // asc.forEach(x=>{
        //     if (x.constraintItem.symbolsInvolved) x.constraintItem.symbolsInvolved.forEach(s=>symbolsInvolved.add(s));
        // });
        // const constraintItem = orIntoConstraintsShallow(asc.map(x=>x.constraintItem));
        // constraintItem.symbolsInvolved = symbolsInvolved;
        return { symtab: unionSymtab, constraintItem: oredConstraint };
    }
    // called from flowGroupInfer.ts when merging branches post-if
    export function orSymtabs(asc: Readonly<RefTypesSymtab[]>,mrNarrow: MrNarrow): RefTypesSymtab {
        return mrNarrow.unionArrRefTypesSymtab(asc);
    }
    export function orConstraints(asc: Readonly<ConstraintItem>[]): ConstraintItem{
        const symbolsInvolved = new Set<Symbol>();
        asc.forEach(x=>{
            if (x.symbolsInvolved) x.symbolsInvolved.forEach(s=>symbolsInvolved.add(s));
        });
        const constraintItem = orIntoConstraintsShallow(asc);
        constraintItem.symbolsInvolved = symbolsInvolved;
        return constraintItem;
    }
    export function orSymtabConstraints(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow /*, getDeclaredType: GetDeclaredTypeFn*/): RefTypesSymtabConstraintItem{
        return orSymtabConstraintsV2(asc, mrNarrow);
    }


    // export function andSymbolTypeIntoSymtabConstraint({symbol,isconst,isAssign,type:typeIn,sc,mrNarrow,getDeclaredType}: Readonly<{
    //     symbol: Readonly<Symbol>,
    //     readonly isconst: undefined | boolean,
    //     readonly isAssign?: boolean | undefined,
    //     type: Readonly<RefTypesType>,
    //     sc: RefTypesSymtabConstraintItem,
    //     getDeclaredType: GetDeclaredTypeFn,
    //     mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
    //     //Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
    //     if (isRefTypesSymtabConstraintItemNever(sc)) return { type:floughTypeModule.createRefTypesType(),sc };
    //     return andSymbolTypeIntoSymtabConstraintV2({ symbol,isconst,isAssign,type:typeIn,sc,mrNarrow,getDeclaredType });
    // }

    export function andSymbolTypeIntoSymtabConstraint({symbol,isconst,isAssign,type:typeIn,sc, mrNarrow, getDeclaredType:_}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        readonly isAssign?: boolean | undefined,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
        const log = false;
        if (log && getMyDebug()){
            floughTypeModule.dbgRefTypesTypeToStrings(typeIn).forEach(s=>consoleLog(`andSymbolTypeIntoSymtabConstraint[in] isconst:${isconst}, isAssigned: ${isAssign}}, typeIn: ${s}`));
            // consoleGroup(`andSymbolTypeIntoSymtabConstraint[in] `
            // +`symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, isconst:${isconst}, type:${floughTypeModule.dbgRefTypesTypeToString(typeIn)}, isAssigned: ${isAssign}}`);
        }
        if (isRefTypesSymtabConstraintItemNever(sc)) return { type:floughTypeModule.createRefTypesType(),sc };

        const constraintItem = sc.constraintItem;
        Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
        let symtab = sc.symtab;
        let typeOut = typeIn;
        //let scOut = sc;
        if (symbol.flags & (SymbolFlags.ConstEnum|SymbolFlags.RegularEnum)){
            // do nothing - an enum parent is not a real type
        }
        else if (!symtab){
            Debug.assert(isRefTypesSymtabConstraintItemNever(sc));
        }
        else {
            if (isAssign){
                symtab = mrNarrow.copyRefTypesSymtab(symtab).setAsAssigned(symbol,typeIn);
            }
            else {
                const type = symtab.get(symbol);
                if (type) {
                    typeOut = floughTypeModule.intersectionOfRefTypesType(type, typeIn);
                    if (!floughTypeModule.equalRefTypesTypes(typeOut,type)){
                        symtab = mrNarrow.copyRefTypesSymtab(symtab).set(symbol,typeOut);
                    }
                }
                else {
                    symtab = mrNarrow.copyRefTypesSymtab(symtab).set(symbol,typeIn);
                }
            }
        }
        if (log && getMyDebug()){
            let str = "andSymbolTypeIntoSymtabConstraint[out] symtab:";
            if (!symtab) str+="<undef>";
            else {
                dbgRefTypesSymtabToStrings(symtab).forEach(s=> consoleLog(`andSymbolTypeIntoSymtabConstraint[out] symtab: ${s}`));
                // symtab.forEach((type,symbol)=>{
                //     const symbolFlowInfo = mrNarrow.mrState.symbolFlowInfoMap.get(symbol);
                //     if (!symbolFlowInfo) {
                //         str+= ` {symbol:${symbol.escapedName}, isconst: <symbolFlowInfo not found>, type:${floughTypeModule.dbgRefTypesTypeToString(type)}},`;
                //         return;
                //     }
                //     const isconst = mrNarrow.mrState.symbolFlowInfoMap.get(symbol)!.isconst;
                //     str += ` {symbol:${symbol.escapedName}, isconst:${isconst}, type:${floughTypeModule.dbgRefTypesTypeToString(type)}},`;
                // });
            }
            consoleLog(str);
            mrNarrow.dbgConstraintItem(constraintItem).forEach(s=>{
                consoleLog("andSymbolTypeIntoSymtabConstraint[out] constraints: "+s);
            });
            consoleGroupEnd();
        }
        return { type: typeOut, sc:{ symtab, constraintItem } };
    }

    export function andSymbolTypeIntoConstraint({symbol,type,constraintItem, getDeclaredType, mrNarrow}: Readonly<{
        symbol: Readonly<Symbol>,
        type: Readonly<RefTypesType>,
        constraintItem: ConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>
        ): ConstraintItem {
        const symbolsInvolved = new Set<Symbol>(constraintItem.symbolsInvolved ?? []);
        symbolsInvolved.add(symbol);
        /////////////////////////
        const evaledType = evalCoverForOneSymbol(symbol,constraintItem,getDeclaredType,mrNarrow);
        if (!floughTypeModule.isASubsetOfB(evaledType,type)){
            constraintItem = andDistributeDivide({symbol,type,cin:constraintItem,getDeclaredType,declaredType: getDeclaredType(symbol),
                mrNarrow});
            /////////////////////////
            if (extraAsserts){
                if (constraintItem.kind===ConstraintItemKind.node && constraintItem.op===ConstraintItemNodeOp.and){
                    // not suitable for release
                    Debug.assert(!constraintItem.constraints.some(subci=>subci.kind===ConstraintItemKind.leaf && subci.symbol===symbol));
                }
            }
            constraintItem = andIntoConstraintShallow({ symbol,type,constraintItem });
        }
        constraintItem.symbolsInvolved = symbolsInvolved;
        return constraintItem;
    }

    /**
     * Same interface as andSymbolTypeIntoSymtabConstraint,
     * orSymbolTypeIntoSymtabConstraint is required because loop processing widens symbol types with cumulative history.
     * @param param0
     */
    // @ ts-ignore
    export function orSymbolTypeIntoSymtabConstraint({symbol,isconst,isAssign,type:typeIn,sc, mrNarrow, getDeclaredType:_getDeclaredType}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        readonly isAssign?: undefined | boolean,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {

        //let constraintItem = sc.constraintItem;
        Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
        let symtab = sc.symtab!;
        //const type = typeIn;
        if (symbol.flags & (SymbolFlags.ConstEnum|SymbolFlags.RegularEnum)){
            // do nothing - an enum parent is not a real type
            return { type:typeIn,sc };
        }
        else if (isconst && mrNarrow.compilerOptions.floughConstraintsEnable){
            Debug.fail("not yet implemented"); // orSymbolTypeIntoSymtabConstraint for isconst && mrNarrow.compilerOptions.mrNarrowConstraintsEnable
            //constraintItem = andSymbolTypeIntoConstraint({ symbol,type,constraintItem,getDeclaredType,mrNarrow });
        }
        else {
            if (isAssign){
                symtab = mrNarrow.copyRefTypesSymtab(symtab).setAsAssigned(symbol,typeIn);
                return { type:typeIn,sc:{
                    symtab,
                    constraintItem: sc.constraintItem,
                }};
            }
            else {
                const gotType = symtab.get(symbol);
                if (!gotType || floughTypeModule.isNeverType(gotType) ||
                floughTypeModule.equalRefTypesTypes(typeIn,gotType)
                ){
                    return { type:typeIn,sc };
                }
                const utype = floughTypeModule.unionOfRefTypesType([typeIn, gotType]);
                symtab = mrNarrow.copyRefTypesSymtab(symtab).set(symbol,utype);
                return {
                    type: utype,
                    sc: {
                        symtab,
                        constraintItem: sc.constraintItem //createFlowConstraintAlways()
                    }
                };
            }
        }
    }

    /**
     * This replaces "evaluateTypeOverConstraint" which could give overly large cover values.
     * This is currently called from within EACH call to `andDistributeDivide` to rectify the constraint tree after it has been simplified.
     * That's a lot! Might be less compuatation-work to leave the constraint item unsimplified and just call visitSOP when evaluation is required.
     */
    // @ts-ignore-error
    type VisitSOPMap = ESMap<Symbol,RefTypesType>;
    function visitSOP(ciTop: Readonly<ConstraintItem>,
        visitor: (mapSymbolType: Readonly<VisitSOPMap>) => void,
        _mrNarrow: MrNarrow, getDeclaredType: GetDeclaredTypeFn):
        void{
        function newMap(){
            return new Map<Symbol,RefTypesType>();
        }
        function copyMap(m: Readonly<VisitSOPMap>){
            return new Map<Symbol,RefTypesType>(m);
        }
        function worker(mapref: [Readonly<VisitSOPMap>],
            ciLeft: Readonly<ConstraintItem>,
            negate: boolean,
            aciRight: Readonly<ConstraintItem[]>):
            void{
            // we should be able optimize by not always copying the map.  TODO:
            // function andSymType(symbol: Symbol, type: RefTypesType, m: Readonly<VisitSOPMap>): VisitSOPMap {
            //     const prevType = mapref[0].get(symbol);
            //     return copyMap(m).set(symbol, prevType ? mrNarrow.intersectionOfRefTypesType(prevType,type) : type);
            // }
            if (ciLeft.kind===ConstraintItemKind.leaf || ciLeft.kind===ConstraintItemKind.always || ciLeft.kind===ConstraintItemKind.never){
                if (ciLeft.kind===ConstraintItemKind.leaf){
                    let type = negate ? floughTypeModule.subtractFromType(ciLeft.type, getDeclaredType(ciLeft.symbol)) : ciLeft.type;
                    const prevType = mapref[0].get(ciLeft.symbol);
                    if (prevType){
                        type = floughTypeModule.intersectionOfRefTypesType(prevType,type);
                        // if type is never, then this product-term will always be never, so there is no need to compute the rest,
                        // therefore simply return.
                        if (floughTypeModule.isNeverType(type)) return;
                    }
                    mapref[0] = copyMap(mapref[0]).set(ciLeft.symbol, type);
                    // negate is "false" because the negate associated with the pulled aciRight[0] was earlier pushed with it.
                    if (aciRight.length) worker(mapref, aciRight[0], /*negate*/ false, aciRight.slice(1));
                    else visitor(mapref[0]);
                }
                else if ((ciLeft.kind===ConstraintItemKind.always && negate) || (ciLeft.kind===ConstraintItemKind.never && !negate)){
                    // Just return the same as if a never type was encountered
                    return;
                }
                else {
                    // Continue working but without making any modification to mapref[0]
                    if (aciRight.length) worker(mapref, aciRight[0], /*negate*/ false, aciRight.slice(1));
                    else visitor(mapref[0]);
                }
            }
            else if (ciLeft.kind===ConstraintItemKind.node){
                if (ciLeft.op===ConstraintItemNodeOp.not) {
                    worker(mapref, ciLeft.constraint, !negate, aciRight);
                }
                if ((ciLeft.op===ConstraintItemNodeOp.or && !negate) || (ciLeft.op===ConstraintItemNodeOp.and && negate)){
                    ciLeft.constraints.forEach(ciOfOr=>{
                        // this might be the only place where a copy of map is really needed
                        worker([copyMap(mapref[0])], ciOfOr, negate, aciRight);
                    });
                }
                else if ((ciLeft.op===ConstraintItemNodeOp.and && !negate) || (ciLeft.op===ConstraintItemNodeOp.or && negate)){
                    let insertRight = ciLeft.constraints.slice(1);
                    if (negate){
                        insertRight = insertRight.map(c=>{
                            if (c.kind===ConstraintItemKind.never) (c.kind as ConstraintItemKind) = ConstraintItemKind.always;
                            else if (c.kind===ConstraintItemKind.always) (c.kind as ConstraintItemKind) = ConstraintItemKind.never;
                            else if (c.kind===ConstraintItemKind.node && c.op===ConstraintItemNodeOp.not) {
                                c = c.constraint;
                            }
                            else {
                                c = { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.not, constraint: c };
                            }
                            return c;
                        });
                    }
                    worker([copyMap(mapref[0])], ciLeft.constraints[0], negate, [...insertRight, ...aciRight]);
                }
            }
        };
        worker([newMap()],ciTop,/*negate*/ false,[]);
    }

    // function evalCoverPerSymbolV1(ciTop: Readonly<ConstraintItem>,
    //     getConstrainedType: GetDeclaredTypeFn,
    //     setOfInvolvedSymbols: Set<Symbol>, getDeclaredType: GetDeclaredTypeFn,
    //     mrNarrow: MrNarrow):
    //  ESMap<Symbol,RefTypesType> {
    //     if (getMyDebug()){
    //         consoleGroup(`evalCoverPerSymbolV1`);
    //     }
    //     const map = new Map<Symbol,RefTypesType>();
    //     let prodnum = 0;
    //     function visitor(mapSymbolType: Readonly<VisitSOPMap>): void {
    //         if (getMyDebug()){
    //             mapSymbolType.forEach((type,symbol)=>{
    //                 consoleLog(`evalCoverPerSymbolV1 vtor#${prodnum} ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${floughTypeModule.dbgRefTypesTypeToString(type)}`);
    //             });
    //             prodnum++;
    //         }
    //         setOfInvolvedSymbols.forEach((dsymbol)=>{
    //             const type = mapSymbolType.get(dsymbol) ?? getConstrainedType(dsymbol);
    //             const got = map.get(dsymbol);
    //             if (!got) map.set(dsymbol,type);
    //             else map.set(dsymbol, mrNarrow.unionOfRefTypesType([got,type]));
    //         });
    //         // mapSymbolType.forEach((type,symbol)=>{
    //         //     const got = map.get(symbol);
    //         //     if (!got) map.set(symbol,type);
    //         //     else map.set(symbol, mrNarrow.unionOfRefTypesType([got,type]));
    //         // });
    //     }
    //     visitSOP(ciTop,visitor,mrNarrow,getDeclaredType);
    //     if (getMyDebug()){
    //         map.forEach((type,symbol)=>{
    //             consoleLog(`evalCoverPerSymbolV1 covermap ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${floughTypeModule.dbgRefTypesTypeToString(type)}`);
    //         });
    //         consoleGroupEnd();
    //     }
    //     return map;
    // }
    function evalCoverPerSymbolV2(ciTop: Readonly<ConstraintItem>,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow):
     ESMap<Symbol,RefTypesType> {
        const log = false;
        if (log && getMyDebug()){
            consoleGroup(`evalCoverPerSymbolV1`);
            mrNarrow.dbgConstraintItem(ciTop).forEach(str=>consoleLog(`evalCoverPerSymbolV1 ciTop: ${str}`));
        }
        const map = new Map<Symbol,RefTypesType>();
        let prodnum = 0;
        function visitor(mapSymbolType: Readonly<VisitSOPMap>): void {
            if (log && getMyDebug()){
                mapSymbolType.forEach((type,symbol)=>{
                    floughTypeModule.dbgRefTypesTypeToStrings(type).forEach(str=>consoleLog(`evalCoverPerSymbolV1 , ${mrNarrow.dbgSymbolToStringSimple(symbol)}, vtor#${prodnum} ${str}`));
                });
                // mapSymbolType.forEach((type,symbol)=>{
                //     consoleLog(`evalCoverPerSymbolV1 vtor#${prodnum} ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${floughTypeModule.dbgRefTypesTypeToString(type)}`);
                // });
                prodnum++;
            }
            if (extraAsserts) {
                Debug.assert(ciTop.symbolsInvolved);
                for (let iter = mapSymbolType.keys(), it = iter.next(); !it.done; it = iter.next()){
                    Debug.assert(ciTop.symbolsInvolved.has(it.value));
                }
            }
            ciTop.symbolsInvolved!.forEach((dsymbol)=>{
                const type = mapSymbolType.get(dsymbol) ?? getDeclaredType(dsymbol);
                const got = map.get(dsymbol);
                if (!got) map.set(dsymbol,type);
                else map.set(dsymbol, floughTypeModule.unionOfRefTypesType([got,type]));
            });
        }
        visitSOP(ciTop,visitor,mrNarrow,getDeclaredType);
        if (log && getMyDebug()){
            map.forEach((type,symbol)=>{
                floughTypeModule.dbgRefTypesTypeToStrings(type).forEach(str=>consoleLog(`evalCoverPerSymbolV1 covermap ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${str}`));
                // consoleLog(`evalCoverPerSymbolV1 covermap ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${floughTypeModule.dbgRefTypesTypeToString(type)}`);
            });
            consoleGroupEnd();
        }
        return map;
    }

    export function evalCoverPerSymbol(...args: Parameters<typeof evalCoverPerSymbolV2>): ESMap<Symbol,RefTypesType>{
        return evalCoverPerSymbolV2(...(args as Parameters<typeof evalCoverPerSymbolV2>));
    }
    // TODO: This can be optimized for one symbol instead of just calling evalCoverPerSymbolV2
    function evalCoverForOneSymbol(symbol: Symbol, ciTop: Readonly<ConstraintItem>,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow):
    RefTypesType {

        const cover = evalCoverPerSymbolV2(ciTop,getDeclaredType,mrNarrow);
        let type = cover.get(symbol);
        if (!type) type=getDeclaredType(symbol);
        ////////////////////////////////
        if (extraAsserts){
            /**
             * Running a comparison test here to condifm results match.
             */
            const compareType = evalTypeOverConstraint({ cin: ciTop, symbol, typeRange:getDeclaredType(symbol),mrNarrow });
            if (floughTypeModule.isASubsetOfB(compareType, type)){
                Debug.fail("unexpected"); // sometimes fails !!!
            }
            if (floughTypeModule.isASubsetOfB(type,compareType)){
                Debug.fail("unexpected"); // sometimes fails !!!
            }
        }
        ////////////////////////////////
        return type;
    }
    export function hasSymbol(symbol: Symbol, sc: Readonly<RefTypesSymtabConstraintItemNotNever>): boolean {
        Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
        return sc.symtab.has(symbol) || !!sc.constraintItem.symbolsInvolved?.has(symbol);
    }

    export function evalSymbol(symbol: Symbol, sc: Readonly<RefTypesSymtabConstraintItem>, getDeclaredType: GetDeclaredTypeFn, mrNarrow: MrNarrow): RefTypesType {
        Debug.assert(!isRefTypesSymtabConstraintItemNever(sc));
        if (!mrNarrow.compilerOptions.floughConstraintsEnable || !sc.constraintItem.symbolsInvolved?.has(symbol)){
            const gotType = sc.symtab!.get(symbol);
            if (!gotType) Debug.fail("unexpected");
            return gotType;
        }
        return evalCoverForOneSymbol(symbol, sc.constraintItem, getDeclaredType, mrNarrow);
    }

    // @ ts-expect-error
    export function collectSymbolsInvolvedInConstraints(ciTop: ConstraintItem): Set<Symbol>{
        const set = new Set<Symbol>();
        const func = (ci: ConstraintItem) => {
            if (ci.kind===ConstraintItemKind.leaf){
                set.add(ci.symbol);
            }
            else if (ci.kind===ConstraintItemKind.node){
                if (ci.op===ConstraintItemNodeOp.not) func(ci.constraint);
                else ci.constraints.forEach(citmp=>func(citmp));
            }
        };
        func(ciTop);
        return set;
    }

    export function testOfEvalTypeOverConstraint(checker: TypeChecker, mrNarrow: MrNarrow): void {
        type Symtab = ESMap<Symbol, RefTypesType>;
        type InType = & { cin: ConstraintItem, declaredSymbolTypes: Symtab };
        // type OutType = ReturnType<typeof evalTypeOverConstraint>;
        type OutType = Symtab;

        function createSymtab(ast: [Symbol,RefTypesType][]): Symtab {
            return new Map<Symbol,RefTypesType>(ast);
        }

        const rttnever = floughTypeModule.createRefTypesType();// never
        const rttbool = floughTypeModule.createRefTypesType(checker.getBooleanType());
        const rtttrue = floughTypeModule.createRefTypesType(checker.getTrueType());
        const rttfalse = floughTypeModule.createRefTypesType(checker.getFalseType());
        const symx = { escapedName:"x" } as any as Symbol;
        const symy = { escapedName:"y" } as any as Symbol;
        const symz = { escapedName:"z" } as any as Symbol;
        const symtabx = new Map<Symbol, RefTypesType>([[symx,rttbool]]);
        const symtabxy = new Map<Symbol, RefTypesType>([[symx,rttbool],[symy,rttbool]]);

        const tn1 = floughTypeModule.createRefTypesType(checker.getNumberLiteralType(1));
        const tn2 = floughTypeModule.createRefTypesType(checker.getNumberLiteralType(2));
        const tn3 = floughTypeModule.createRefTypesType(checker.getNumberLiteralType(3));
        //const tn4 = floughTypeModule.createRefTypesType(checker.getNumberLiteralType(4));
        const t123 = floughTypeModule.unionOfRefTypesType([tn1,tn2,tn3]);
        // @ts-ignore
        const symtab123 = new Map<Symbol, RefTypesType>([[symx,t123],[symy,t123],[symz,t123]]);


        // @ts-expect-error
        const rttNum = floughTypeModule.createRefTypesType(checker.getNumberType());
        // @ts-expect-error
        const rttStr = floughTypeModule.createRefTypesType(checker.getStringType());
        // @ts-expect-error
        const rttNumStr = floughTypeModule.createRefTypesType([checker.getNumberType(), checker.getStringType()]);
        // @ts-expect-error
        const rttLitNum0 = floughTypeModule.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,0));
        // @ts-expect-error
        const rttLitNum1 = floughTypeModule.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,1));

        const datum: {in: InType,out: OutType}[] = [
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rtttrue),
                    declaredSymbolTypes: symtabx
                },
                out: createSymtab([[symx,rtttrue]])
            },
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rttfalse),
                    declaredSymbolTypes: symtabx
                },
                out: createSymtab([[symx,rttfalse]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeNot(createFlowConstraintLeaf(symx, rttfalse)),
                    declaredSymbolTypes: symtabx
                },
                out: createSymtab([[symx,rtttrue]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintLeaf(symy, rtttrue),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rtttrue],[symy,rtttrue]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({negate:true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintLeaf(symy, rtttrue),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttbool],[symy,rttbool]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttbool],[symy,rttbool]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({negate:true,constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttfalse],[symy,rttfalse]])
            },
            {
                in: {
                    cin: createFlowConstraintAlways(),
                    declaredSymbolTypes: symtabxy
                },
                out: symtabxy // should be the same as the declared
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttbool],[symy,rttbool]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({negate: true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttnever],[symy,rttnever]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rtttrue),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttbool],[symy,rttbool]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({negate:true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rtttrue),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttfalse],[symy,rtttrue]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeOr({constraints:[
                            createFlowConstraintNodeAnd({constraints:[
                                createFlowConstraintLeaf(symx, rttfalse),
                                createFlowConstraintLeaf(symy, rtttrue),
                            ]}),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rtttrue],[symy,rttfalse]])
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({negate:true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeOr({constraints:[
                            createFlowConstraintNodeAnd({constraints:[
                                createFlowConstraintLeaf(symx, rttfalse),
                                createFlowConstraintLeaf(symy, rtttrue),
                            ]}),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    declaredSymbolTypes: symtabxy
                },
                out: createSymtab([[symx,rttbool],[symy,rttbool]])
            },
        ];
        datum.forEach((data,_iter)=>{
             //if (_iter!==10) return;
            // if (_iter>4) return;
            const getDeclaredType = (symbol: Symbol) => {
                return data.in.declaredSymbolTypes.get(symbol)!;
            };
            if (getMyDebug()){
                consoleGroup(`----${_iter}`);
                mrNarrow.dbgConstraintItem(data.in.cin).forEach(s=> consoleLog(`in[${_iter}] ${s}`));
                let sopIdx = 0;
                visitSOP(data.in.cin, (map: Readonly<VisitSOPMap>)=>{
                    let str = `out[${_iter}],[sop#${sopIdx++}]`;
                    map.forEach((type,symbol)=>{
                        floughTypeModule.dbgRefTypesTypeToStrings(type).forEach(s=>str+=` ${mrNarrow.dbgSymbolToStringSimple(symbol)}:${s},`);
                        // str += ` ${mrNarrow.dbgSymbolToStringSimple(symbol)}:${floughTypeModule.dbgRefTypesTypeToString(type)},`;
                    });
                    consoleLog(str);
                }, mrNarrow, getDeclaredType);
                consoleGroupEnd();
            }
            const setOfInvolvedSymbols = new Set<Symbol>();
            for (let iter = data.in.declaredSymbolTypes.keys(), it=iter.next(); !it.done; it = iter.next()){
                setOfInvolvedSymbols.add(it.value);
            }
            const coverMap = evalCoverPerSymbol(data.in.cin, getDeclaredType, mrNarrow);
            if (true){
                coverMap.forEach((_type,symbol)=>{
                    Debug.assert(data.out.has(symbol), `data[${_iter}].out missing symbol ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                });
                data.out.forEach((type,symbol)=>{
                    const actualType = coverMap.get(symbol) ?? floughTypeModule.createRefTypesType(); // never

                    Debug.assert(floughTypeModule.isASubsetOfB(actualType,type),"fail",
                        ()=> floughTypeModule.dbgRefTypesTypeToStrings(actualType).join(",") + " is not a subset of " + floughTypeModule.dbgRefTypesTypeToStrings(type).join(","));
                        // `data[${_iter}] fail symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, mrNarrow.isASubsetOfB(actualType:${floughTypeModule.dbgRefTypesTypeToString(actualType)}, expectedType:${floughTypeModule.dbgRefTypesTypeToString(type)})`);
                    Debug.assert(floughTypeModule.isASubsetOfB(type, actualType), "fail",
                        ()=>`expectedType:`+floughTypeModule.dbgRefTypesTypeToStrings(type).join(",") + ";;; actualType:" + floughTypeModule.dbgRefTypesTypeToStrings(actualType).join(","));
                        ///`data[${_iter}] fail symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, mrNarrow.isASubsetOfB(expectedType:${floughTypeModule.dbgRefTypesTypeToString(type)}, actualType:${floughTypeModule.dbgRefTypesTypeToString(actualType)})`);
                });
            }
        });
    }


}


