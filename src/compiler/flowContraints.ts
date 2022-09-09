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

    function getIntersectionIfNotStrictSuperset(tsub: Readonly<RefTypesType>, type: Readonly<RefTypesType>, negateType: boolean): undefined | RefTypesType {
        return undefined;
    }

    export function simplifyConstraintBySubstitution(
        // @ts-expect-error
        cin: ConstraintItemNode, symbol: Symbol, type: RefTypesType, pushNegate: boolean, mrNarrow: MrNarrow
        // @ts-expect-error
    ): ConstraintItem {

        if ((!pushNegate && cin.op===ConstraintItemNodeOp.and) || (pushNegate && cin.op===ConstraintItemNodeOp.or)){
            let tsub = type;
            let changed = true;
            //const removedIdxs: number[] = [];
            let constraints = cin.constraints;
            while (changed) {
                changed = false;
                const nextConstraints: ConstraintItem[] = [];
                constraints.forEach((c,idx)=>{
                    //if (removedIdxs.includes(idx)) return;
                    if (c.kind===ConstraintItemKind.leaf){
                        if (c.symbol===symbol){
                            /**
                             * if tsub is not a superset of c.type, then leaf will be replaced by intersection
                             */
                            const tmpType = getIntersectionIfNotStrictSuperset(tsub, c.type, pushNegate ? !(c.negate??false) : (c.negate??false));
                            if (tmpType){
                                changed = true;
                                //removedIdxs.push(idx);
                                tsub = tmpType;
                                nextConstraints.push()
                            }
                        }
                    }
                    else {
                        Debug.assert(c.kind===ConstraintItemKind.node);

                    }
                });
            }
            if (removedIdxs.length){
                if (removedIdxs.length===cin.constraints.length){
                    // convert to leaf
                    return {
                        kind: ConstraintItemKind.leaf,
                        symbol,
                        type: tsub,
                        negate: false
                    };
                }
            }
        }
        //let narrowedType = type;
        // if (constraintItem.kind===ConstraintItemKind.leaf){
        //     if (constraintItem.symbol!==symbol) return constraintItem;
        //     let narrowedType = mrNarrow.intersectRefTypesTypes(type, constraintItem.type);

        // }

        // if (constraintItemNode.op===ConstraintItemNodeOp.and){
        //     constraintItemNode.constraints.forEach(c=>{
        //         if (c.kind===ConstraintItemKind.leaf){
        //             if (c.symbol===symbol){
        //                 narrowedType = mrNarrow.intersectRefTypesTypes(narrowedType, c.type);
        //                 if (mrNarrow.isNeverType(narrowedType)){

        //                 }
        //             }
        //         }
        //         else {
        //             if (c.op===ConstraintItemNodeOp.and){

        //             }
        //             else {

        //             }
        //         }
        //     });
        // }
    }
    // @ts-expect-error
    export function andIntoConstrainTrySimplify({symbol, type, constraintItemNode}: {symbol: Symbol, type: RefTypesType, constraintItemNode: ConstraintItemNode | undefined}): [ConstraintItemNode, RefTypesType] {

    }
}
