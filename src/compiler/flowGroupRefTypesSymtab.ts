namespace ts {


    const mrNarrow: MrNarrow = undefined as any as MrNarrow;
    const symbolFlowInfoMap: SymbolFlowInfoMap = undefined as any as SymbolFlowInfoMap;
    export function initializeFlowGroupRefTypesSymtabModule(mrNarrowIn: MrNarrow){
        (mrNarrow as any) = mrNarrowIn;
        (symbolFlowInfoMap as any) = mrNarrowIn.mrState.symbolFlowInfoMap;
    }

    export interface RefTypesSymtabProxyI {
        has(symbol: Symbol): boolean;
        get(symbol: Symbol): RefTypesType | undefined;
        set(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxyI;
        // getAsAssigned(symbol: Symbol): RefTypesType | undefined;
        setAsAssigned(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxyI;
        delete(symbol: Symbol): void;
        forEach(f: (type: RefTypesType, symbol: Symbol) => void): void;
        getAssignCount(): number;
        get size(): number;
    }
    /**
     * RefTypesSymtabProxyType and RefTypesSymtabProxyInnerSymtab need to be exported because getInnerSymtab is exported.
     */
    export type RefTypesSymtabProxyType = & {type: RefTypesType, assignedType: RefTypesType | undefined};
    export type RefTypesSymtabProxyInnerSymtab = ESMap<Symbol,RefTypesSymtabProxyType>;

    class RefTypesSymtabProxy implements RefTypesSymtabProxyI {
        readonly symtabOuter: Readonly<RefTypesSymtabProxy> | undefined;
        symtabInner: RefTypesSymtabProxyInnerSymtab;
        isSubloop?: boolean;
        loopState?: ProcessLoopState;
        loopGroup?: GroupForFlow;
        assignCount: number;

        constructor(symtabOuter?: Readonly<RefTypesSymtabProxy>, symtabInner?: RefTypesSymtabProxyInnerSymtab, isSubloop?: boolean, loopState?: ProcessLoopState, loopGroup?: GroupForFlow, assignCount?: number){
            this.assignCount = assignCount??0;
            this.symtabOuter = symtabOuter;
            this.symtabInner = new Map<Symbol,RefTypesSymtabProxyType>(symtabInner);
            if (isSubloop){
                this.isSubloop = true;
                Debug.assert(loopState && loopGroup);
                this.loopState = loopState;
                this.loopGroup = loopGroup;
            }
            else {
                Debug.assert(!loopState && !loopGroup);
            }
        }
        has(symbol: Symbol): boolean {
            if (this.symtabInner.has(symbol)) return true;
            const sfi = symbolFlowInfoMap.get(symbol);
            if (!sfi) return false;
            if (sfi.isconst) return !!this.symtabOuter?.has(symbol);
            return false;
        }
        /**
         * if no entry in symbolFlowInfoMap, undefined is retuned.
         * If the symbol is in innerSymtab, that type is returned.
         * else if symbolFlowInfo.isconst===true, outerSymbtab is queried.
         * else if symbol in this.loopState.symbolsReadNotAssigned, outerSymtab is queried,
         * else, symbolFlowInfo.effectiveDeclaredType is returned.
         */
        get(symbol: Symbol): RefTypesType | undefined {
            if (!this.isSubloop) {
                Debug.assert(!this.symtabOuter);
                return this.symtabInner.get(symbol)?.type;
            }
            // TODO: move A to after B
            const sfi = symbolFlowInfoMap.get(symbol); // A
            if (!sfi) return undefined; // A
            const pt = this.symtabInner.get(symbol); // B
            if (pt) return pt.type; // B
            if (sfi.isconst) {
                const type = this.symtabOuter?.get(symbol);
                Debug.assert(type);
                this.symtabInner.set(symbol,{ type, assignedType: undefined });
                return type;
            }
            if (this.loopState?.invocations!==0){
                let range: RefTypesType | undefined;
                if (!(range=this.loopState?.symbolsAssignedRange?.get(symbol))){
                    // symbol wasn't assigned in invocation 0, so can be treated like a const
                    const type = this.symtabOuter?.get(symbol);
                    Debug.assert(type);
                    this.symtabInner.set(symbol,{ type, assignedType: undefined });
                    return type;
                }
                else {
                    // symbol was assigned in invocation 0, and the range of that assignment is reflected in the type here
                    const outer = this.symtabOuter?.get(symbol);
                    const type = outer ? floughTypeModule.unionOfRefTypesType([range,outer]) : range;
                    this.symtabInner.set(symbol,{ type, assignedType: undefined });
                    return type;
                }
            }
            const type = mrNarrow.getEffectiveDeclaredType(sfi);
            this.symtabInner.set(symbol, { type, assignedType: undefined });
            return type;
        }
        /**
         *
         * @param symbol
         * @param type
         * @returns
         */
        set(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxy {
            // NOTE: do NOT try to set pt elements - it is unsafe because someone else could be using the pt object.
            const pt = this.symtabInner.get(symbol);
            this.symtabInner.set(symbol,{ type, assignedType: pt?.assignedType ? type : undefined });
            return this;
        }
        setAsAssigned(symbol: Symbol, type: Readonly<RefTypesType>): RefTypesSymtabProxy {
            // NOTE: do NOT try to set pt elements - it is unsafe because someone else could be using the pt object.
            this.assignCount++;
            this.symtabInner.set(symbol,{ type, assignedType: type });
            return this;
        }
        getAssignCount(): number { return this.assignCount; }
        delete(symbol: Symbol): boolean {
            const ret = this.symtabInner.delete(symbol);
            if (this.loopState){
                this.loopState.symbolsAssigned?.delete(symbol);
                this.loopState.symbolsAssignedRange?.delete(symbol);
            }
            return ret;
        }
        // This function will go away because it is only(*) used is in accumulateSymtabs, which will go away
        // when isSubloop is fully implemented. (*also used for logging). --- actaully accumulate still used for final loop condition, so still required.
        forEach(f: (type: RefTypesType, symbol: Symbol) => void): void {
            this.symtabInner.forEach((pt,s)=>f(pt.type,s));
        }
        get size(): number { return this.symtabOuter?.size??0 + this.symtabInner.size; }
    }

    export type RefTypesSymtab = RefTypesSymtabProxyI;

    export function isRefTypesSymtabConstraintItemNever(sc: Readonly<RefTypesSymtabConstraintItem>): sc is RefTypesSymtabConstraintItemNever {
        return isNeverConstraint(sc.constraintItem);
    }
    // function isRefTypesSymtabConstraintItemNotNever(sc: Readonly<RefTypesSymtabConstraintItem>): sc is RefTypesSymtabConstraintItemNotNever {
    //     return !isNeverConstraint(sc.constraintItem);
    // }

    function createSubloopRefTypesSymtab(outer: Readonly<RefTypesSymtab>, loopState: ProcessLoopState, loopGroup: Readonly<GroupForFlow>): RefTypesSymtab {
        assertCastType<Readonly<RefTypesSymtabProxy>>(outer);
        return new RefTypesSymtabProxy(outer,undefined,/*isSubloop*/true, loopState, loopGroup);
    }
    export function createSubLoopRefTypesSymtabConstraint(outerSC: Readonly<RefTypesSymtabConstraintItem>, loopState: ProcessLoopState, loopGroup: Readonly<GroupForFlow>): RefTypesSymtabConstraintItem {
        if (isRefTypesSymtabConstraintItemNever(outerSC)) return outerSC;// as RefTypesSymtabConstraintItemNever;
        //castType<Readonly<RefTypesSymtabConstraintItemNotNever>>(outerSC);
        return {
            symtab: createSubloopRefTypesSymtab(outerSC.symtab!, loopState, loopGroup),
            constraintItem: outerSC.constraintItem
        } ;
    }

    function createSuperloopRefTypesSymtab(stin: Readonly<RefTypesSymtab>): RefTypesSymtab {
        // function getProxyType(symbol: Symbol, st: Readonly<RefTypesSymtabProxy>): RefTypesSymtabProxyType | undefined {
        //     return st.symtabInner.get(symbol) ?? (st.symtabOuter ? getProxyType(symbol, st.symtabOuter) : undefined);
        //  }
        assertCastType<Readonly<RefTypesSymtabProxy>>(stin);
        Debug.assert(!stin.isSubloop || stin.loopState);
        if (getMyDebug()){
            consoleGroup(`createSuperloopRefTypesSymtab[in]`);
            // if (stin.isSubloop){
            //     consoleLog(`createSuperloopRefTypesSymtab[in] idx:${stin.loopGroup?.groupIdx}, invocations${stin.loopState?.invocations}`);
            // }
            dbgRefTypesSymtabToStrings(stin).forEach(str=>consoleLog(`createSuperloopRefTypesSymtab[in] stin: ${str}`));
        }
        const stout = copyRefTypesSymtab(stin.symtabOuter!);
        //let symbolsReadNotAssigned: undefined | Set<Symbol>;
        stin.symtabInner.forEach((pt,symbol)=>{
            // eslint-disable-next-line prefer-const
            let type = pt.type;
            if (!pt.assignedType){
                // After changing to simple `stout.set(symbol, type);` is there any need for pt.assignedType
                // const outerType = stin.symtabOuter?.get(symbol);
                // if (outerType) type = mrNarrow.intersectionOfRefTypesType(type,outerType);
                // else stout.set(symbol, type);
                stout.set(symbol, type);
            }
            else {
                stout.setAsAssigned(symbol, type);
            }
        });
        //if (stin.loopState) stin.loopState.symbolsReadNotAssigned = symbolsReadNotAssigned;
        if (getMyDebug()){
            dbgRefTypesSymtabToStrings(stout).forEach(str=>consoleLog(`createSuperloopRefTypesSymtab[out] stout: ${str}`));
            consoleLog(`createSuperloopRefTypesSymtab[out]`);
            consoleGroupEnd();
        }
        return stout;
    }
    export function createSuperloopRefTypesSymtabConstraintItem(sc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
        if (isRefTypesSymtabConstraintItemNever(sc)) return sc;// as RefTypesSymtabConstraintItemNever;
        return {
            symtab: createSuperloopRefTypesSymtab(sc.symtab!),
            constraintItem: sc.constraintItem
        };
    };


    export function getSymbolsAssignedRange(that: Readonly<RefTypesSymtab>): WeakMap<Symbol,RefTypesType> | undefined {
        assertCastType<Readonly<RefTypesSymtabProxy>>(that);
        let sar: WeakMap<Symbol,RefTypesType> | undefined;
        that.symtabInner.forEach((pt,s)=>{
            if (pt.assignedType) (sar ?? (sar=new WeakMap<Symbol,RefTypesType>())).set(s,pt.assignedType);
        });
        return sar;
    }

    export function createRefTypesSymtab(): RefTypesSymtab {
        return new RefTypesSymtabProxy();
    }
    export function createRefTypesSymtabWithEmptyInnerSymtab(templateSymtab: Readonly<RefTypesSymtab> | undefined): RefTypesSymtab {
        Debug.assert(templateSymtab instanceof RefTypesSymtabProxy);
        assertCastType<Readonly<RefTypesSymtabProxy>>(templateSymtab);
        return new RefTypesSymtabProxy(templateSymtab.symtabOuter,undefined,templateSymtab.isSubloop, templateSymtab.loopState, templateSymtab.loopGroup);
    }
    export function createRefTypesSymtabConstraintWithEmptyInnerSymtab(templatesc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
        Debug.assert(!isRefTypesSymtabConstraintItemNever(templatesc));
        return {
            symtab: createRefTypesSymtabWithEmptyInnerSymtab(templatesc.symtab),
            constraintItem: { ...templatesc.constraintItem }
        };
    }


    export function copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
        Debug.assert(symtab instanceof RefTypesSymtabProxy);
        assertCastType<Readonly<RefTypesSymtabProxy>>(symtab);
        return new RefTypesSymtabProxy(symtab.symtabOuter,symtab.symtabInner,symtab.isSubloop, symtab.loopState, symtab.loopGroup, symtab.assignCount);
    }
    export function copyRefTypesSymtabConstraintItem(sc: Readonly<RefTypesSymtabConstraintItem>): RefTypesSymtabConstraintItem {
        if (isRefTypesSymtabConstraintItemNever(sc)) return { constraintItem: { ...sc.constraintItem } };
        return {
            symtab: copyRefTypesSymtab(sc.symtab!),
            constraintItem: { ...sc.constraintItem }
        };
    }
    export function createRefTypesSymtabConstraintItemNever(): RefTypesSymtabConstraintItemNever {
        return { constraintItem: createFlowConstraintNever() };
    }

    export function unionArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab {
        const dolog = true;
        if (dolog && getMyDebug()){
            consoleGroup(`unionArrRefTypesSymtab[in]`);
            arr.forEach((rts,i)=>{
                dbgRefTypesSymtabToStrings(rts).forEach(str=>consoleLog(`unionArrRefTypesSymtab[in] symtab[${i}] ${str}`));
            });
        }
        function unionArrRefTypesSymtab1(): RefTypesSymtab {
            assertCastType<Readonly<RefTypesSymtabProxy>[]>(arr);
            if (arr.length===0) Debug.fail("unexpected");
            if (arr.length===1) return arr[0];
            for (let i=1; i<arr.length; i++){
                Debug.assert(arr[i-1].symtabOuter === arr[i].symtabOuter);
            }
            const mapSymToPType = new Map<Symbol,{set: Set<Type>, setAssigned: Set<Type>}>();
            arr.forEach(rts=>{
                rts.symtabInner.forEach((pt,symbol)=>{
                    let ptypeGot = mapSymToPType.get(symbol);
                    if (!ptypeGot) {
                        ptypeGot = { set:new Set<Type>(), setAssigned:new Set<Type>() };
                        mapSymToPType.set(symbol, ptypeGot);
                    }
                    floughTypeModule.forEachRefTypesTypeType(pt.type, tstype=>ptypeGot!.set.add(tstype));
                    if (pt.assignedType) floughTypeModule.forEachRefTypesTypeType(pt.assignedType, tstype=>ptypeGot!.setAssigned.add(tstype));
                });
            });

            const target = createRefTypesSymtabWithEmptyInnerSymtab(arr[0]) as RefTypesSymtabProxy;
            assertCastType<Readonly<RefTypesSymtabProxy>>(target);

            //const target = new RefTypesSymtabProxy(arr[0].symtabOuter,undefined,arr[0].);
            mapSymToPType.forEach(({set, setAssigned},symbol)=>{
                // c.f. _caxnc-whileLoop-0023 - for all i, s.t. arr[i].symbtabInner does not have symbol, must lookup in symtabOuter
                if (!arr[0].isSubloop){
                    for (const rts of arr){
                        if (!rts.symtabInner.has(symbol)){
                            const otype = mrNarrow.getEffectiveDeclaredType(symbolFlowInfoMap.get(symbol) ?? Debug.fail("unexpected"));
                            floughTypeModule.forEachRefTypesTypeType(otype, tstype=>set.add(tstype));
                            break;
                        }
                    }
                }
                else {
                    for (const rts of arr){
                        if (!rts.symtabInner.has(symbol)){
                            const otype = rts.symtabOuter?.get(symbol);
                            if (otype){
                                floughTypeModule.forEachRefTypesTypeType(otype, tstype=>set.add(tstype));
                                break;
                            }
                        }
                    }
                }
                const atype: Type[]=[];
                set.forEach(t=>atype.push(t));
                const type = floughTypeModule.createRefTypesType(atype);
                const aAssignedType: Type[] = [];
                setAssigned.forEach(t=>aAssignedType.push(t));
                let assignedType: RefTypesType | undefined;
                if (setAssigned.size) assignedType = floughTypeModule.createRefTypesType(aAssignedType);
                target.symtabInner.set(symbol,{ type, assignedType });
            });
            return target;
        }
        const target = unionArrRefTypesSymtab1();
        {
            if (dolog && getMyDebug()){
                dbgRefTypesSymtabToStrings(target).forEach(str=>consoleLog(`unionArrRefTypesSymtab[out] return: ${str}`));
                consoleGroupEnd();
            }
        }
        return target;
    }
    export function modifiedInnerSymtabUsingOuterForFinalCondition(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
        const dolog = true;
        if (dolog && getMyDebug()){
            consoleGroup(`modifiedInnerSymtabUsingOuterForFinalCondition[in]`);
            dbgRefTypesSymtabToStrings(symtab).forEach(str=>consoleLog(`modifiedInnerSymtabUsingOuterForFinalCondition[in] symtab: ${str}`));
        }
        assertCastType<Readonly<RefTypesSymtabProxy>>(symtab);
        const updates: [Symbol,RefTypesType][] = [];
        symtab.symtabInner.forEach((pt,symbol)=>{
            let otype: RefTypesType | undefined;
            if (otype=symtab.symtabOuter!.get(symbol)){
                if (!symtab.loopState?.symbolsAssignedRange?.has(symbol)){
                    // a priori the inner type can only be a subset of the outer type.
                    if (!mrNarrow.isASubsetOfB(otype,pt.type)){
                        // pt.type is a strict subset of otype
                        updates.push([symbol,otype]);
                    } // else they are equal, do nothing
                }
                else {
                    if (mrNarrow.isASubsetOfB(pt.type,otype)){
                        if (!mrNarrow.isASubsetOfB(otype, pt.type)) {
                            updates.push([symbol,otype]);
                        }
                    }
                    else if (!mrNarrow.isASubsetOfB(otype, pt.type)){
                        updates.push([symbol,floughTypeModule.unionOfRefTypesType([pt.type,otype])]);
                    }
                }
            }
        });
        let symtab1: RefTypesSymtabProxy;
        if (!updates.length) symtab1 = symtab;
        else {
            symtab1 = copyRefTypesSymtab(symtab) as RefTypesSymtabProxy;
            updates.forEach(([symbol,type])=>symtab1.symtabInner.set(symbol,{ type,assignedType:undefined }));
        }
        if (dolog && getMyDebug()){
            dbgRefTypesSymtabToStrings(symtab1).forEach(str=>consoleLog(`modifiedInnerSymtabUsingOuterForFinalCondition[out] symtab: ${str}`));
            consoleGroupEnd();
        }
        return symtab1;
    }
    export function getOuterSymtab(symtab: Readonly<RefTypesSymtab>): Readonly<RefTypesSymtab> | undefined {
        return (symtab as RefTypesSymtabProxy).symtabOuter;
    }
    export function getInnerSymtab(symtab: Readonly<RefTypesSymtab>): Readonly<RefTypesSymtabProxyInnerSymtab> {
        return (symtab as RefTypesSymtabProxy).symtabInner;
    }


    export function dbgRefTypesSymtabToStrings(x: RefTypesSymtab): string[] {
        assertCastType<RefTypesSymtabProxy>(x);
        const as: string[]=["["];
        if (x.isSubloop){
            as.push(`loopGroup?.groupIdx:${x.loopGroup?.groupIdx}, x.loopState?.invocations:${x.loopState?.invocations}`);
            let str = `x.loopState.symbolsAssigned:[`;
            x.loopState!.symbolsAssigned?.forEach(s=>{
                str+=`${mrNarrow.dbgSymbolToStringSimple(s)},`;
            });
            str+=`]`;
            as.push(str);

            str = `x.loopState.symbolsAssignedRange:[`;
            const symbolsDone = new Set<Symbol>();
            x.symtabOuter?.forEach((_pt,s)=>{
                symbolsDone.add(s);
                if (x.loopState!.symbolsAssignedRange?.has(s)){
                    const rangeType = x.loopState!.symbolsAssignedRange.get(s)!;
                    str+=`{symbol:${mrNarrow.dbgSymbolToStringSimple(s)},type:${floughTypeModule.dbgRefTypesTypeToString(rangeType)}}, `;
                };
            });
            x.symtabInner.forEach((_pt,s)=>{
                if (symbolsDone.has(s)) return;
                if (x.loopState!.symbolsAssignedRange?.has(s)){
                    const rangeType = x.loopState!.symbolsAssignedRange.get(s)!;
                    str+=`{symbol:${mrNarrow.dbgSymbolToStringSimple(s)},type:${floughTypeModule.dbgRefTypesTypeToString(rangeType)}}, `;
                };
            });
            str+=`]`;
            as.push(str);
        }
        x.symtabInner.forEach(({type,assignedType},s)=>{
            as.push(`  symbol:${mrNarrow.dbgSymbolToStringSimple(s)}, `
             + `{ type:${floughTypeModule.dbgRefTypesTypeToString(type)}, assignedType:${assignedType?floughTypeModule.dbgRefTypesTypeToString(type):"<undef>"}}`);
        });
        if (x.symtabOuter){
            as.push(...dbgRefTypesSymtabToStrings(x.symtabOuter).map(str=>`  outer:${str}`));
        }
        as.push("]");
        return as;
    }

    export function dbgRefTypesSymtabConstrinatItemToStrings(sc: Readonly<RefTypesSymtabConstraintItem>): string[] {
        const as: string[]=["{"];
        if (!sc.symtab) as.push(`  symtab:<undef>`);
        else dbgRefTypesSymtabToStrings(sc.symtab).forEach(s=>`  symtab: ${s}`);
        mrNarrow.dbgConstraintItem(sc.constraintItem).forEach(s=>`  constraintItem: ${s}`);
        as.push(`}`);
        return as;
    }

}




