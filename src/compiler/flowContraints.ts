namespace ts {

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            negate,
            constraints
        };
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.or,
            negate,
            constraints
        };
    }
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType, negate?: boolean): ConstraintItemLeaf {
        return negate? {
            kind: ConstraintItemKind.leaf,
            symbol, type, negate
        } : {
            kind: ConstraintItemKind.leaf,
            symbol, type
        };
    }
    // @ts-expect-error
    export function mrNarrowTypeByConstraint({symbol, type, constraintItemNode}: {symbol: Symbol, type: RefTypesType, constraintItemNode: ConstraintItemNode}): RefTypesType {
        return type;
    }

    function calcIntersectionIfNotImplied(tsub: Readonly<RefTypesType>, type: Readonly<RefTypesType>, negateType: boolean): undefined | RefTypesType {
        return undefined;
    }

    export function simplifyConstraintBySubstitution(
        cin: ConstraintItemNode, symbol: Symbol, type: RefTypesType, mrNarrow: MrNarrow
        // @ts-expect-error
    ): null | ConstraintItem {

        if (cin.op===ConstraintItemNodeOp.and){
            /**
             * case and:
             * For each member constr of cin
             *   If tsub implies constr, then remove constr, else replace tsub with and(tsub,constr).
             * Finally, if (type!==tsub) then add tsub as constraint
             */
            let tsub = type;
            let changed = true;
            let hadAnyChange0 = false;
            //const removedIdxs: number[] = [];
            let constraints = cin.constraints;
            while (changed) {
                changed = false;
                //const changedContent: [idx:number, ct: ConstraintItem][] = [];
                const removedIdxSet = new Set<number>();
                const changedConstraints: ConstraintItem[] = [];
                constraints.forEach((c,idx)=>{
                    //if (removedIdxs.includes(idx)) return;
                    if (c.kind===ConstraintItemKind.leaf){
                        if (c.symbol===symbol){
                            /**
                             * if tsub is not a superset of c.type, then leaf will be replaced by intersection
                             */
                            //const cNegate = pushNegate ? !(c.negate??false) : (c.negate??false);
                            const tmpType = calcIntersectionIfNotImplied(tsub, c.type, c.negate??false);
                            removedIdxSet.add(idx);
                            if (tmpType){
                                tsub = tmpType;
                            }
                        }
                    }
                    else {
                        Debug.assert(c.kind===ConstraintItemKind.node);
                        const c1 = simplifyConstraintBySubstitution(c, symbol, tsub, mrNarrow);
                        if (c1!==c){
                            removedIdxSet.add(idx);
                            if (c1) changedConstraints.push(c1);
                        }

                    }
                });
                if (removedIdxSet.size){
                    hadAnyChange0 = true;
                    changed = true;
                    constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
                    constraints.push(...changedConstraints);
                }

            } // while changed
            if (!hadAnyChange0) return cin;
            if (constraints.length===0) {
                // eslint-disable-next-line no-null/no-null
                if (tsub===type) return null;
                return {
                    kind: ConstraintItemKind.leaf,
                    type: tsub,
                    negate: false,
                    symbol
                };
            }
            if (tsub!==type) {
                constraints.push({
                    kind: ConstraintItemKind.leaf,
                    type: tsub,
                    negate: false,
                    symbol
                });
            }
            return {
                ...cin,
                constraints
            };
        }
        else if (cin.op===ConstraintItemNodeOp.or){
            /**
             * case or:
             * If for any member constr of cin, type implies constr, then type implies cin, so return null.
             */
            const removedIdxSet = new Set<number>();
            const changedConstraints: ConstraintItem[] = [];
            let constraints = cin.constraints;
            for (let idx=0; idx<constraints.length; idx++){
                const c = constraints[idx];
                if (c.kind===ConstraintItemKind.leaf){
                    if (c.symbol===symbol){
                        const tmpType = calcIntersectionIfNotImplied(type, c.type, c.negate??false);
                        // eslint-disable-next-line no-null/no-null
                        if (!tmpType) return null;
                        removedIdxSet.add(idx);
                        changedConstraints.push({
                            kind: ConstraintItemKind.leaf,
                            type: tmpType,
                            negate: false,
                            symbol
                        });
                    }
                }
                else if (c.kind===ConstraintItemKind.node){
                    const c1 = simplifyConstraintBySubstitution(c, symbol, type, mrNarrow);
                    // eslint-disable-next-line no-null/no-null
                    if (!c1) return null;
                    if (c1!==c){
                        removedIdxSet.add(idx);
                        if (c1) changedConstraints.push(c1);
                    }
                }
                else Debug.assert(false);
            }
            let hadAnyChange = false;
            if (removedIdxSet.size||changedConstraints.length){
                constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
                constraints.push(...changedConstraints);
                hadAnyChange = true;
            }
            if (!hadAnyChange) return cin;
            // eslint-disable-next-line no-null/no-null
            if (constraints.length===0) return null;
            return {
                ...cin,
                constraints
            };
        }
    }
    // @ts-expect-error
    export function andIntoConstrainTrySimplify({symbol, type, constraintItemNode}: {symbol: Symbol, type: RefTypesType, constraintItemNode: ConstraintItemNode | undefined}): [ConstraintItemNode, RefTypesType] {

    }
}
