namespace ts {

    export type RefType = & {
        type: Type,
        // if for some node, isConstantReference(node) && node symbol is s, then any nodex with the same symbol is also constant, right?
        const: boolean
    };
    export type RefTypes = & {
        //byRef: Set<Node>;
        bySymbol: ESMap<Symbol, RefType>;
    };
    export type RefTypesRtn = & {
        rtnType: Type;
        refTypes: RefTypes;
    };

    export enum InferCritKind {
        none= "none",
        truthy= "truthy",
        notnullundef= "notnullundef",
        assignable= "assignable",
    };
    // const InferCritKind = {
    //     none: "none",
    //     truthy: "truthy",
    //     notnullundef: "notnullundef",
    //     assignable:"assignable",
    // } as const;
    //type InferCritKind = typeof InferCritKind[ keyof typeof InferCritKind ];
    export type InferCrit =
    (
    | {
        kind: typeof InferCritKind.none // this is just to get the resulting type without any criteria
        negate?: false;
    }
    | {
        kind: typeof InferCritKind.truthy
        negate?: boolean;
    }
    | {
        kind: typeof InferCritKind.notnullundef;
        negate?: boolean;
    }
    | {
        kind: typeof InferCritKind.assignable;
        negate?: boolean;
        target: Type;
    }) & {alsoFailing?: boolean}; // also output failing, in addition to passing

    export type InferRefArgsContext = & { nonNullExpression?: true};
    export type InferRefArgs = & {
        refTypes: RefTypes,
        condExpr: Readonly<Expression>,
        crit: InferCrit,
        context?: InferRefArgsContext,
        /**
         * If an inferRefTypes caller needs the qdotfallout info, they must place this parameter in the call.
         * If any intermediate has a questionDot token, they must ask for it (crit:alsoFailing) and push the failing result to qdotfallout.
         */
        //qdotfallout?: RefTypesRtn[],  - a solution in search of a problem?
    };

    /**
     * InferRefRtnType
     * This is also the result of applyCrit...
     * Finally multiple branches are projected onto this binary state.
     */
    export type InferRefRtnType = & {
        passing: RefTypesRtn;
        failing?: RefTypesRtn;
    };

    export type CheckExprData = & {
        node: Node;
        isConst: boolean;
        symbol: Symbol;
        type: Type;
    };
    export type ConditionStackItem = & {
        expr: Expression;
        assume: boolean;
        //involved: ESMap<Symbol, CheckExprData[]>;
    };
    // export interface TempCheckExprCache {
    //     bySymbol: ESMap<Symbol, CheckExprData[]>;
    // }
    export type AliasableAssignmentCacheItem = & {
        expr: Expression;
    };
    export type AliasableAssignmentCache = & {
        bySymbol: ESMap<Symbol, AliasableAssignmentCacheItem>;
    };

}
