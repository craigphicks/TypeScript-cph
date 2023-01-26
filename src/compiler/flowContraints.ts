/* eslint-disable no-null/no-null */
namespace ts {

    // @ ts-expect-error
    export type GetDeclaredTypeFn = (symbol: Symbol) => RefTypesType;

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected constraints.length<=1");
        const c: ConstraintItemNodeAnd = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: (ConstraintItem)[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected constraints.length<=1");
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
    export function isNeverConstraint(c: ConstraintItem): boolean {
        return (c.kind===ConstraintItemKind.never);
    }
    export function createFlowConstraintAlways(): ConstraintItemAlways {
        return { kind:ConstraintItemKind.always, symbolsInvolved: new Set<Symbol>() };
    }
    // @ts-ignore
    export function isAlwaysConstraint(c: ConstraintItem): boolean {
        return (c.kind===ConstraintItemKind.always);
    }

    // export function evalTypeOverConstraint({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
    //     cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    // }): RefTypesType {
    //     depth=depth??0;
    //     if (getMyDebug()){
    //         const as: string[] = [];
    //         consoleGroup(`evalTypeOverConstraint[in][${depth}]`);
    //         as.push(`evalTypeOverConstraint[in][${depth}]: depth:${depth}, symbol:${symbol.escapedName}, negate:${negate}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(typeRange)}.`);
    //         if (!cin) as.push(`evalTypeOverConstraint[in][${depth}]: constraint: undefined`);
    //         else mrNarrow.dbgConstraintItem(cin).forEach(s=>as.push(`evalTypeOverConstraint[in][${depth}]: constraint: ${s}`));
    //         as.forEach(s=>consoleLog(s));
    //     }
    //     const r = evalTypeOverConstraint_aux({ cin, symbol, typeRange, negate, mrNarrow, depth });
    //     if (getMyDebug()){
    //         consoleLog(`evalTypeOverConstraint[out][${depth}]: ${mrNarrow.dbgRefTypesTypeToString(r)}`);
    //         consoleGroupEnd();
    //     }
    //     return r;
    // }

    // function evalTypeOverConstraint_aux({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
    //     cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    // }): RefTypesType {
    //     depth=depth??0;
    //     if (mrNarrow.isNeverType(typeRange)){
    //         return typeRange;
    //     }
    //     if (mrNarrow.isAnyType(typeRange) || mrNarrow.isUnknownType(typeRange)){
    //         Debug.fail("TODO: mrNarrow.isAnyType(type) || mrNarrow.isUnknownType(type)");
    //     }

    //     if (cin.kind===ConstraintItemKind.always) return !negate ? typeRange : mrNarrow.createRefTypesType();
    //     if (cin.kind===ConstraintItemKind.never){
    //         if (!negate) return mrNarrow.createRefTypesType(); // never
    //         return typeRange;
    //     }
    //     if (cin.kind===ConstraintItemKind.leaf){
    //         if (!negate){
    //             if (cin.symbol!==symbol) return typeRange;
    //             return mrNarrow.intersectionOfRefTypesType(cin.type,typeRange);
    //         }
    //         else {
    //             if (cin.symbol!==symbol) return mrNarrow.createRefTypesType(); // never
    //             return mrNarrow.subtractFromType(cin.type,typeRange);
    //         }
    //     }
    //     else if (cin.kind===ConstraintItemKind.node){
    //         //Debug.assert(cin.kind===ConstraintItemKind.node);
    //         if (cin.op===ConstraintItemNodeOp.not){
    //             return evalTypeOverConstraint({ cin:cin.constraint, symbol, typeRange, negate:!negate, mrNarrow, depth:depth+1 });
    //         }
    //         if (cin.op===ConstraintItemNodeOp.and && !negate || cin.op===ConstraintItemNodeOp.or && negate){
    //             let isectType = typeRange;
    //             for (const subc of cin.constraints){
    //                 const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange:isectType, mrNarrow, depth:depth+1 });
    //                 if (mrNarrow.isNeverType(subType)) return subType;
    //                 if (subType!==isectType && !mrNarrow.isASubsetOfB(isectType,subType)) isectType=subType;
    //             }
    //             return isectType;
    //         }
    //         if (cin.op===ConstraintItemNodeOp.or && !negate || cin.op===ConstraintItemNodeOp.and && negate){
    //             const unionType = mrNarrow.createRefTypesType(); // never
    //             for (const subc of cin.constraints){
    //                 const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange, mrNarrow, depth:depth+1 });
    //                 mrNarrow.mergeToRefTypesType({ source:subType, target:unionType });
    //                 if (mrNarrow.isASubsetOfB(typeRange,unionType)) return typeRange;
    //             }
    //             return unionType;
    //         }
    //     }
    //     Debug.fail();
    // }

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
     *
     * TODO: change parameter name from typeRange to declaredType
     */
    export function andDistributeDivide({
        symbol, type, declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, getDeclaredType: GetDeclaredTypeFn,
            mrNarrow: MrNarrow, refCountIn?: [number], refCountOut?: [number], depth?: number
    }): ConstraintItem {
        if (!refCountIn) refCountIn=[0];
        if (!refCountOut) refCountOut=[0];
        const doLog = false;
        if (doLog && getMyDebug()){
            consoleGroup(`andDistributeDivide[in][${depth??0}] symbol:${symbol.escapedName}, type: ${mrNarrow.dbgRefTypesTypeToString(type)}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(declaredType)}, negate: ${negate??false}}, countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
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
        if (mrNarrow.isAnyType(type)) {
            //Debug.fail("not yet implemented");
            // return createFlowConstraintAlways();
            return cin;
        }
        if (mrNarrow.isUnknownType(type)) {
            //Debug.fail("not yet implemented");
            // return createFlowConstraintAlways();
            return cin;
        }
        depth = depth??0;
        refCountIn[0]++;
        refCountOut[0]++;
        if (mrNarrow.isNeverType(type)) return createFlowConstraintNever();
        if (mrNarrow.isASubsetOfB(declaredType,type)) {
            // Bug fix with ConstraintsV2
            // keep on going, (could also just return cin?).
            //return createFlowConstraintAlways();
        }
        if ((cin.kind===ConstraintItemKind.never && !negate) || (cin.kind===ConstraintItemKind.always && negate)) return createFlowConstraintNever();
        if ((cin.kind===ConstraintItemKind.never && negate) || (cin.kind===ConstraintItemKind.always && !negate)) return createFlowConstraintAlways();
        if (cin.kind===ConstraintItemKind.leaf){
            if (symbol===cin.symbol){
                if (mrNarrow.isNeverType(cin.type)) Debug.fail("unexpected");
                //if (mrNarrow.isASubsetOfB(typeRange,cin.type)) Debug.fail("unexpected, cin should be always");
                if (mrNarrow.isAnyType(cin.type)) Debug.fail("not yet implemented");
                if (mrNarrow.isUnknownType(cin.type)) Debug.fail("not yet implemented");
            }
            if (!negate) {
                if (symbol!==cin.symbol) {
                    return cin; //createFlowConstraintLeaf(cin.symbol, cin.type);
                }
                else {
                    // @ ts-expect-error
                    const isectType = mrNarrow.intersectionOfRefTypesType(cin.type, type);
                    if (mrNarrow.isNeverType(isectType)) return createFlowConstraintNever();
                    if (!mrNarrow.isASubsetOfB(type,isectType)) return createFlowConstraintLeaf(symbol,isectType);
                    return createFlowConstraintAlways();
                }
            }
            else {
                if (symbol!==cin.symbol) {
                    refCountOut[0]++;
                    return createFlowConstraintNodeNot(cin);
                }
                else {
                    const isectInvType = mrNarrow.intersectionOfRefTypesType(mrNarrow.subtractFromType(cin.type, declaredType), type);
                    if (mrNarrow.isNeverType(isectInvType)) return createFlowConstraintNever();
                    if (!mrNarrow.isASubsetOfB(type,isectInvType)) return createFlowConstraintLeaf(symbol,isectInvType);
                    return createFlowConstraintAlways();
                }
            }
        }
        else {
            Debug.assert(cin.kind===ConstraintItemKind.node);
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
                        const ctype = mrNarrow.intersectionOfRefTypesType(...atype);
                        if (mrNarrow.isNeverType(ctype)) hasNeverLeaf = true;
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
                        const ctype = mrNarrow.unionOfRefTypesType(atype);
                        const cdeclType = getDeclaredType(csymbol);
                        if (mrNarrow.isASubsetOfB(cdeclType,ctype)) hasAlwaysLeaf = true;
                        constraints.push({ kind:ConstraintItemKind.leaf,symbol:csymbol,type:ctype });
                    }
                });
                if (hasAlwaysLeaf) return createFlowConstraintAlways();
                if (constraints.length===0) return createFlowConstraintNever();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeOr({ constraints });
            }
            Debug.fail();
        }
    }

    function andIntoConstraintShallow({symbol, type, constraintItem, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem, mrNarrow: MrNarrow}): ConstraintItem {
        if (mrNarrow.isNeverType(type)) return createFlowConstraintNever();
        // TODO: if there was a symbol table input we could check for always
        if (constraintItem.kind===ConstraintItemKind.always){
            return { kind: ConstraintItemKind.leaf, symbol, type };
        }
        if (constraintItem.kind===ConstraintItemKind.never) return constraintItem;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol===symbol){
                const isecttype = mrNarrow.intersectionOfRefTypesType(type, constraintItem.type);
                if (mrNarrow.isNeverType(isecttype)) return createFlowConstraintNever();
                // TODO: if there was a symbol table input we could check for "always"
                if (useConstraintsV2()){
                    // I think it was a bug not to use isecttype for V1, but did not seem to affect the result?
                    return createFlowConstraintLeaf(symbol, isecttype);
                }
                return createFlowConstraintLeaf(symbol, type);
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
    export function useConstraintsV2(): boolean {
        return true;
    }

    /**
     *  Calculate "or" (union) of array of RefTypesSymtabConstraintItem
     * @param asc
     * @param getDeclaredType
     * Prior to combining under an or node, each sub-constraint is shallow anded with each of its symtab entries {symbol,type} if necessary,
     * where necessity exists if type is a strict subset of unionSymtab.get(symbol).
     */
    function orSymtabConstraintsV1(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow /*, getDeclaredType: GetDeclaredTypeFn*/): RefTypesSymtabConstraintItem{
        const mapSymbolCount = new Map<Symbol,number>();
        asc.forEach(sc=>sc.symtab.forEach((_,symbol)=>{
            const got = mapSymbolCount.get(symbol);
            if (!got) mapSymbolCount.set(symbol,1);
            else mapSymbolCount.set(symbol,got+1);
        }));
        const unionSymtab = mrNarrow.unionArrRefTypesSymtab(asc.map(x=>x.symtab)); // isconst===false symbols get properly handled here
        const arrCI: ConstraintItem[] = [];
        asc.forEach(({symtab,constraintItem})=>{
            symtab.forEach(({leaf:{isconst,type}},symbol)=>{
                if (isconst && mapSymbolCount.get(symbol)!>1 && !mrNarrow.isASubsetOfB(unionSymtab.get(symbol)!.leaf.type, type)) {
                    constraintItem = andIntoConstraintShallow({ symbol,type,constraintItem,mrNarrow });
                }
            });
            arrCI.push(constraintItem);
        });
        return { symtab: unionSymtab, constraintItem: orIntoConstraintsShallow(arrCI) };
    }
    function orSymtabConstraintsV2(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow): RefTypesSymtabConstraintItem{
        const unionSymtab = mrNarrow.unionArrRefTypesSymtab(asc.map(x=>x.symtab));
        const oredConstraint = orConstraintsV2(asc.map(x=>x.constraintItem));
        // const symbolsInvolved = new Set<Symbol>();
        // asc.forEach(x=>{
        //     if (x.constraintItem.symbolsInvolved) x.constraintItem.symbolsInvolved.forEach(s=>symbolsInvolved.add(s));
        // });
        // const constraintItem = orIntoConstraintsShallow(asc.map(x=>x.constraintItem));
        // constraintItem.symbolsInvolved = symbolsInvolved;
        return { symtab: unionSymtab, constraintItem: oredConstraint };
    }
    // called from flowGroupInfer.ts when merging branches post-if
    export function orConstraintsV2(asc: Readonly<ConstraintItem>[]): ConstraintItem{
        const symbolsInvolved = new Set<Symbol>();
        asc.forEach(x=>{
            if (x.symbolsInvolved) x.symbolsInvolved.forEach(s=>symbolsInvolved.add(s));
        });
        const constraintItem = orIntoConstraintsShallow(asc);
        constraintItem.symbolsInvolved = symbolsInvolved;
        return constraintItem;
    }
    export function orSymtabConstraints(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow /*, getDeclaredType: GetDeclaredTypeFn*/): RefTypesSymtabConstraintItem{
        if (!useConstraintsV2()) return orSymtabConstraintsV1(asc,mrNarrow);
        else return orSymtabConstraintsV2(asc, mrNarrow);
    }

    function andSymbolTypeIntoSymtabConstraintV1({symbol,isconst,type,sc, mrNarrow, getDeclaredType}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
        const log = false;
        if (log && getMyDebug()){
            consoleGroup(`andSymbolTypeIntoSymtabConstraint[in] `
            +`symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, isconst:${isconst}, type:${mrNarrow.dbgRefTypesTypeToString(type)}}`);
        }

        assertSymtabConstraintInvariance({ symtab: sc.symtab, constraintItem: sc.constraintItem }, getDeclaredType, mrNarrow);

        let { symtab, constraintItem: tmpConstraintItem } = sc;
        let setTypeTmp = type;
        const got = symtab.get(symbol);
        symtab = mrNarrow.copyRefTypesSymtab(symtab); // for now always make this copy even though it might not be modified TODO:
        if (got) {
            setTypeTmp = mrNarrow.intersectionOfRefTypesType(got.leaf.type, type);
        }
        symtab.set(symbol,{ leaf:mrNarrow.createRefTypesTableLeaf(symbol,isconst,setTypeTmp) });

        if (isconst){  // shouldn't need to do this if isASubsetOfB(type,setTypeTmp)
            const declType = getDeclaredType(symbol);
            const refCountIn = [0] as [number];
            const refCountOut = [0] as [number];
            tmpConstraintItem = andDistributeDivide({ symbol, type: setTypeTmp, declaredType: declType, cin: tmpConstraintItem, mrNarrow, getDeclaredType, refCountIn, refCountOut });

            // Some subconstraints may have collapsed thus destroying the SymtabConstraint invariance, and so the symtab must be corrected before returning.
            const setOfInvolvedSymbols = new Set<Symbol>();
            symtab.forEach(({leaf},tmpSymbol)=>{
                if (!leaf.isconst) return;
                setOfInvolvedSymbols.add(tmpSymbol);
            });
            const cover = evalCoverPerSymbol(tmpConstraintItem,
                (s: Symbol)=>{ return symtab.get(s)!.leaf.type; },
                setOfInvolvedSymbols, getDeclaredType, mrNarrow);
            cover.forEach((ctype,csymbol)=>{
                symtab.set(
                    csymbol,
                    {leaf: {
                        kind: RefTypesTableKind.leaf,
                        symbol:csymbol,
                        isconst: true,
                        type: ctype,
                    },
                });
            });
        }
        // this call to assertSymtabConstraintInvariance is probably overkill now
        assertSymtabConstraintInvariance({ symtab, constraintItem: tmpConstraintItem }, getDeclaredType, mrNarrow);
        if (log && getMyDebug()){
            consoleLog(`andSymbolTypeIntoSymtabConstraint[out]`
            +`type:${mrNarrow.dbgRefTypesTypeToString(setTypeTmp)}}`);
            consoleGroupEnd();
        }
        return { type: setTypeTmp, sc:{ symtab, constraintItem: tmpConstraintItem } };
    };

    function andSymbolTypeIntoSymtabConstraintV2({symbol,isconst,type:typeIn,sc, mrNarrow, getDeclaredType}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
        const log = false;
        if (log && getMyDebug()){
            consoleGroup(`andSymbolTypeIntoSymtabConstraint[in] `
            +`symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, isconst:${isconst}, type:${mrNarrow.dbgRefTypesTypeToString(typeIn)}}`);
        }
        let constraintItem = sc.constraintItem;
        let symtab = sc.symtab;
        let type = typeIn;
        if (symbol.flags & (SymbolFlags.ConstEnum|SymbolFlags.RegularEnum)){
            // do nothing - an enum parent is not a real type
        }
        else if (isconst){
            const symbolsInvolved = new Set<Symbol>(constraintItem.symbolsInvolved ?? []);
            symbolsInvolved.add(symbol);
            /////////////////////////
            constraintItem = andDistributeDivide({symbol,type,cin:constraintItem,getDeclaredType,declaredType: getDeclaredType(symbol),
                mrNarrow});
            /////////////////////////
            constraintItem = andIntoConstraintShallow({ symbol,type,constraintItem,mrNarrow });
            constraintItem.symbolsInvolved = symbolsInvolved;
        }
        else {
            const got = symtab.get(symbol);
            if (!got) type = getDeclaredType(symbol);
            else type = mrNarrow.intersectionOfRefTypesType(type, got.leaf.type);
            symtab = mrNarrow.copyRefTypesSymtab(symtab).set(symbol,{ leaf: mrNarrow.createRefTypesTableLeaf(symbol,/*isconst*/ false,type) });
        }
        if (log && getMyDebug()){
            // consoleLog(`andSymbolTypeIntoSymtabConstraint[out]`
            // +`type:${mrNarrow.dbgRefTypesTypeToString(type)}}`);
            let str = "`andSymbolTypeIntoSymtabConstraint[out] symtab:";
            symtab.forEach(({leaf})=>{
                str += ` {symbol:${leaf.symbol!.escapedName}, isconst:${leaf.isconst}, type:${mrNarrow.dbgRefTypesTypeToString(leaf.type)}},`;
            });
            consoleLog(str);
            mrNarrow.dbgConstraintItem(constraintItem).forEach(s=>{
                consoleLog("andSymbolTypeIntoSymtabConstraint[out] constraints: "+s);
            });
            consoleGroupEnd();
        }
        // when useConstraintsV2() is true, the returned type is a dummy.
        return { type: null as any as RefTypesType, sc:{ symtab, constraintItem } };
    }

    export function andSymbolTypeIntoSymtabConstraint({symbol,isconst,type:typeIn,sc, mrNarrow, getDeclaredType}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
        if (!useConstraintsV2()){
            return andSymbolTypeIntoSymtabConstraintV1({ symbol,isconst,type:typeIn,sc, mrNarrow, getDeclaredType });
        }
        else {
            return andSymbolTypeIntoSymtabConstraintV2({ symbol,isconst,type:typeIn,sc, mrNarrow, getDeclaredType });
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
        mrNarrow: MrNarrow, getDeclaredType: GetDeclaredTypeFn):
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
                    let type = negate ? mrNarrow.subtractFromType(ciLeft.type, getDeclaredType(ciLeft.symbol)) : ciLeft.type;
                    const prevType = mapref[0].get(ciLeft.symbol);
                    if (prevType){
                        type = mrNarrow.intersectionOfRefTypesType(prevType,type);
                        // if type is never, then this product-term will always be never, so there is no need to compute the rest,
                        // therefore simply return.
                        if (mrNarrow.isNeverType(type)) return;
                    }
                    mapref[0] = copyMap(mapref[0]).set(ciLeft.symbol, type);
                    // negate is "false" because the negate associated with the pulled aciRight[0] was earlier pushed with it.
                    if (aciRight.length) worker(mapref, aciRight[0], /*negate*/ false, aciRight.slice(1));
                    else visitor(mapref[0]);
                }
                else if ((ciLeft.kind===ConstraintItemKind.always && negate) || (ciLeft.kind===ConstraintItemKind.never && !negate)){
                    // Just return the same as if a never type was encountered
                    // Debug.fail("case never not yet implemented");
                    return;
                }
                else {
                    // Continue working but without making any modification to mapref[0]
                    //Debug.fail("case always not yet implemented");
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

    function evalCoverPerSymbolV1(ciTop: Readonly<ConstraintItem>,
        getConstrainedType: GetDeclaredTypeFn,
        setOfInvolvedSymbols: Set<Symbol>, getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow):
     ESMap<Symbol,RefTypesType> {
        if (getMyDebug()){
            consoleGroup(`evalCoverPerSymbolV1`);
        }
        const map = new Map<Symbol,RefTypesType>();
        let prodnum = 0;
        function visitor(mapSymbolType: Readonly<VisitSOPMap>): void {
            if (getMyDebug()){
                mapSymbolType.forEach((type,symbol)=>{
                    consoleLog(`evalCoverPerSymbolV1 vtor#${prodnum} ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${mrNarrow.dbgRefTypesTypeToString(type)}`);
                });
                prodnum++;
            }
            setOfInvolvedSymbols.forEach((dsymbol)=>{
                const type = mapSymbolType.get(dsymbol) ?? getConstrainedType(dsymbol);
                const got = map.get(dsymbol);
                if (!got) map.set(dsymbol,type);
                else map.set(dsymbol, mrNarrow.unionOfRefTypesType([got,type]));
            });
            // mapSymbolType.forEach((type,symbol)=>{
            //     const got = map.get(symbol);
            //     if (!got) map.set(symbol,type);
            //     else map.set(symbol, mrNarrow.unionOfRefTypesType([got,type]));
            // });
        }
        visitSOP(ciTop,visitor,mrNarrow,getDeclaredType);
        if (getMyDebug()){
            map.forEach((type,symbol)=>{
                consoleLog(`evalCoverPerSymbolV1 covermap ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${mrNarrow.dbgRefTypesTypeToString(type)}`);
            });
            consoleGroupEnd();
        }
        return map;
    }
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
                    consoleLog(`evalCoverPerSymbolV1 vtor#${prodnum} ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${mrNarrow.dbgRefTypesTypeToString(type)}`);
                });
                prodnum++;
            }
            if (true){
                if (!ciTop.symbolsInvolved){
                    Debug.assert(ciTop.symbolsInvolved);
                }
                for (let iter = mapSymbolType.keys(), it = iter.next(); !it.done; it = iter.next()){
                    Debug.assert(ciTop.symbolsInvolved.has(it.value));
                }
                ciTop.symbolsInvolved.forEach((dsymbol)=>{
                    const type = mapSymbolType.get(dsymbol) ?? getDeclaredType(dsymbol);
                    const got = map.get(dsymbol);
                    if (!got) map.set(dsymbol,type);
                    else map.set(dsymbol, mrNarrow.unionOfRefTypesType([got,type]));
                });
            }
            else {
                mapSymbolType.forEach((type,symbol)=>{
                    const got = map.get(symbol);
                    if (!got) map.set(symbol,type);
                    else map.set(symbol, mrNarrow.unionOfRefTypesType([got,type]));
                });
            }
        }
        visitSOP(ciTop,visitor,mrNarrow,getDeclaredType);
        if (log && getMyDebug()){
            map.forEach((type,symbol)=>{
                consoleLog(`evalCoverPerSymbolV1 covermap ${mrNarrow.dbgSymbolToStringSimple(symbol)}, ${mrNarrow.dbgRefTypesTypeToString(type)}`);
            });
            consoleGroupEnd();
        }
        return map;
    }

    export function evalCoverPerSymbol(...args: Parameters<typeof evalCoverPerSymbolV1> | Parameters<typeof evalCoverPerSymbolV2>): ESMap<Symbol,RefTypesType>{
        if (args.length===3) return evalCoverPerSymbolV2(...(args as Parameters<typeof evalCoverPerSymbolV2>));
        else return evalCoverPerSymbolV1(...(args as Parameters<typeof evalCoverPerSymbolV1>));
    }
    // TODO: This can be optimized for one symbol instead of just calling evalCoverPerSymbolV2
    export function evalCoverForOneSymbol(symbol: Symbol, ciTop: Readonly<ConstraintItem>,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow):
    RefTypesType {
        Debug.assert(useConstraintsV2());
        const cover = evalCoverPerSymbolV2(ciTop,getDeclaredType,mrNarrow);
        const got = cover.get(symbol);
        if (!got) return getDeclaredType(symbol);
        else return got;
        // Debug.assert(cover.has(symbol));
        // return cover.get(symbol)!;
    }

    // @ ts-expect-error
    function collectSymbolsInvolvedInConstraints(ciTop: ConstraintItem): Set<Symbol>{
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

    export function assertSymtabConstraintInvariance({symtab,constraintItem}: Readonly<RefTypesSymtabConstraintItem>, getDeclaredType: GetDeclaredTypeFn, mrNarrow: MrNarrow): void {
        // assert that every symbol involved in constraints is also in symtab
        const set = collectSymbolsInvolvedInConstraints(constraintItem);
        set.forEach(symbol=>{
            if (!symtab.has(symbol)){
                const astr: string[]=[];
                astr.push("assertSymtabConstraintInvariance symtab must containt all symbol involved in constraint");
                astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=>astr.push(`symtab: ${s}`));
                mrNarrow.dbgConstraintItem(constraintItem).forEach(s=>astr.push(`constraintItem:${s}`));
                Debug.fail(astr.join(`\n`));
            }
        });
        const setOfInvolvedSymbols = new Set<Symbol>();
        symtab.forEach(({leaf},tmpSymbol)=>{
            if (!leaf.isconst) return;
            setOfInvolvedSymbols.add(tmpSymbol);
        });
        const cover = evalCoverPerSymbol(constraintItem,
            (s: Symbol)=>{ return symtab.get(s)!.leaf.type; },
            setOfInvolvedSymbols, getDeclaredType, mrNarrow);
        cover.forEach((type,symbol)=>{
            const symtabType = symtab.get(symbol)?.leaf.type;
            Debug.assert(symtabType);
            if (!mrNarrow.isASubsetOfB(type,symtabType) || !mrNarrow.isASubsetOfB(symtabType,type)){
                const astr: string[]=[];
                astr.push("assertSymtabConstraintInvariance evaledType and type must be equal");
                astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                astr.push(`symtabType: ${mrNarrow.dbgRefTypesTypeToString(symtabType)}`);
                astr.push(`coverType:${mrNarrow.dbgRefTypesTypeToString(type)}`);
                mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=> astr.push(`symtab: ${s}`));
                mrNarrow.dbgConstraintItem(constraintItem).forEach(s=> astr.push(`constraintItem: ${s}`));
                Debug.fail(astr.join(`\n`));
            }
        });
    }

    /**
     * TODO: Not at all sure about this.  We cannot remove variables are they go out of scope because returns or other jumps means the variable still plays a role
     * because it is entangled with other variables outside the scope.
     * Another way to say it that the scope (in terms of flow) really doesn't end (despite lexically ending).
     * @param cin
     * @param rmset
     * @param _mrNarrow
     * @returns
     */
    // @ts-ignore
    export function removeSomeVariablesFromConstraint(cin: ConstraintItem, rmset: { has(s: Symbol): boolean}, _mrNarrow: MrNarrow): ConstraintItem {
        Debug.fail();
        // const call = (cin: ConstraintItem): ConstraintItem => {
        //     if (cin.kind===ConstraintItemKind.always || cin.kind===ConstraintItemKind.never) return cin;
        //     if (cin.kind===ConstraintItemKind.leaf){
        //         if (rmset.has(cin.symbol)) return createFlowConstraintAlways();
        //         else return cin;
        //     }
        //     else if (cin.kind===ConstraintItemKind.node){
        //         if (cin.op===ConstraintItemNodeOp.not){
        //             const cout = call(cin.constraint);
        //             if (isAlwaysConstraint(cout)) return createFlowConstraintNever();
        //             if (isNeverConstraint(cout)) return createFlowConstraintAlways();
        //             return createFlowConstraintNodeNot(cout);
        //         }
        //         if (cin.op===ConstraintItemNodeOp.and){
        //             const acout: (ConstraintItem)[]=[];
        //             for (const c of cin.constraints){
        //                 const cout = call(c);
        //                 if (isAlwaysConstraint(cout)) continue;
        //                 if (isNeverConstraint(cout)) return createFlowConstraintNever();
        //                 acout.push(c);
        //             }
        //             if (acout.length===0) return createFlowConstraintAlways();
        //             if (acout.length===1) return acout[0];
        //             return { ...cin, constraints: acout };
        //         }
        //         if (cin.op===ConstraintItemNodeOp.or){
        //             const acout: (ConstraintItem)[]=[];
        //             for (const c of cin.constraints){
        //                 const cout = call(c);
        //                 if (isAlwaysConstraint(cout)) return createFlowConstraintAlways();
        //                 if (isNeverConstraint(cout)) continue;
        //                 acout.push(c);
        //             }
        //             if (acout.length===0) return createFlowConstraintNever();
        //             if (acout.length===1) return acout[0];
        //             return { ...cin, constraints: acout };
        //         }
        //     }
        //     Debug.fail();
        // };
        // return call(cin);
    }

    export function testOfEvalTypeOverConstraint(checker: TypeChecker, mrNarrow: MrNarrow): void {
        type Symtab = ESMap<Symbol, RefTypesType>;
        type InType = & { cin: ConstraintItem, declaredSymbolTypes: Symtab };
        // type OutType = ReturnType<typeof evalTypeOverConstraint>;
        type OutType = Symtab;

        function createSymtab(ast: [Symbol,RefTypesType][]): Symtab {
            return new Map<Symbol,RefTypesType>(ast);
        }

        const rttnever = mrNarrow.createRefTypesType();// never
        const rttbool = mrNarrow.createRefTypesType(checker.getBooleanType());
        const rtttrue = mrNarrow.createRefTypesType(checker.getTrueType());
        const rttfalse = mrNarrow.createRefTypesType(checker.getFalseType());
        const symx = { escapedName:"x" } as any as Symbol;
        const symy = { escapedName:"y" } as any as Symbol;
        const symz = { escapedName:"z" } as any as Symbol;
        const symtabx = new Map<Symbol, RefTypesType>([[symx,rttbool]]);
        const symtabxy = new Map<Symbol, RefTypesType>([[symx,rttbool],[symy,rttbool]]);

        const tn1 = mrNarrow.createRefTypesType(checker.getNumberLiteralType(1));
        const tn2 = mrNarrow.createRefTypesType(checker.getNumberLiteralType(2));
        const tn3 = mrNarrow.createRefTypesType(checker.getNumberLiteralType(3));
        //const tn4 = mrNarrow.createRefTypesType(checker.getNumberLiteralType(4));
        const t123 = mrNarrow.unionOfRefTypesType([tn1,tn2,tn3]);
        // @ts-ignore
        const symtab123 = new Map<Symbol, RefTypesType>([[symx,t123],[symy,t123],[symz,t123]]);


        // @ts-expect-error
        const rttNum = mrNarrow.createRefTypesType(checker.getNumberType());
        // @ts-expect-error
        const rttStr = mrNarrow.createRefTypesType(checker.getStringType());
        // @ts-expect-error
        const rttNumStr = mrNarrow.createRefTypesType([checker.getNumberType(), checker.getStringType()]);
        // @ts-expect-error
        const rttLitNum0 = mrNarrow.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,0));
        // @ts-expect-error
        const rttLitNum1 = mrNarrow.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,1));

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
                        str += ` ${mrNarrow.dbgSymbolToStringSimple(symbol)}:${mrNarrow.dbgRefTypesTypeToString(type)},`;
                    });
                    consoleLog(str);
                }, mrNarrow, getDeclaredType);
                consoleGroupEnd();
            }
            const setOfInvolvedSymbols = new Set<Symbol>();
            for (let iter = data.in.declaredSymbolTypes.keys(), it=iter.next(); !it.done; it = iter.next()){
                setOfInvolvedSymbols.add(it.value);
            }
            const coverMap = evalCoverPerSymbol(data.in.cin, /*getConstrainedType*/ getDeclaredType,
                setOfInvolvedSymbols, getDeclaredType, mrNarrow);
            coverMap.forEach((_type,symbol)=>{
                Debug.assert(data.out.has(symbol), `data[${_iter}].out missing symbol ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                // const expectedType = data.out.get(symbol)!;
                // Debug.assert(mrNarrow.isASubsetOfB(expectedType,type));
                // Debug.assert(mrNarrow.isASubsetOfB(type, expectedType));
            });
            data.out.forEach((type,symbol)=>{
                const actualType = coverMap.get(symbol) ?? mrNarrow.createRefTypesType(); // never
                Debug.assert(mrNarrow.isASubsetOfB(actualType,type),
                    `data[${_iter}] fail symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, mrNarrow.isASubsetOfB(actualType:${mrNarrow.dbgRefTypesTypeToString(actualType)}, expectedType:${mrNarrow.dbgRefTypesTypeToString(type)})`);
                Debug.assert(mrNarrow.isASubsetOfB(type, actualType),
                    `data[${_iter}] fail symbol:${mrNarrow.dbgSymbolToStringSimple(symbol)}, mrNarrow.isASubsetOfB(expectedType:${mrNarrow.dbgRefTypesTypeToString(type)}, actualType:${mrNarrow.dbgRefTypesTypeToString(actualType)})`);
            });

            // const type = evalTypeOverConstraint(data.in);
            // Debug.assert(mrNarrow.equalRefTypesTypes(data.out,type),
            //     `expected ${mrNarrow.dbgRefTypesTypeToString(data.out)}, actual: ${mrNarrow.dbgRefTypesTypeToString(type)}}`);
        });

        // Have to remove this test until the new arg "getDeclaredType" is provided
        //andDistributeDivide
        // type DDArgs = Parameters<typeof andDistributeDivide>["0"];
        // const dddata: { in: DDArgs, out: (cout: ConstraintItem) => void }[] = [
        //     {
        //         in: {
        //             symbol:symx, type:rttLitNum0, declaredType: rttNumStr,
        //             cin: createFlowConstraintLeaf(symx, rttNumStr),
        //             mrNarrow, refCountIn:[0], refCountOut:[0]
        //         },
        //         out: (cout: ConstraintItem) => {
        //             Debug.assert(isAlwaysConstraint(cout));
        //         }
        //     }
        // ];
        // dddata.forEach(dda=>{
        //     // @ts-expect-error
        //     const r = andDistributeDivide(dda.in);
        // });

    }


}


