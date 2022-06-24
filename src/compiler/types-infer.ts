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

    export type InferTypeArgsQDotFallout = RefTypesRtn[];
    export type InferRefArgsContext = & { nonNullExpression?: true};
    export type InferRefArgs = & {
        refTypes: RefTypes,
        condExpr: Readonly<Expression>,
        crit: InferCrit,
        context?: InferRefArgsContext, // This ONLY applies to next call, should not be forward beyond.  TODO: change name to `immedContext` to make that obvious.
        /**
         * If an inferRefTypes caller needs the qdotfallout info, they must place this parameter in the call.
         * If any intermediate has a questionDot token, they must ask for it (crit:alsoFailing) and push the failing result to qdotfallout.
         * Trying to decide whether this is really necessary or not, and an argument in favor of necessary is as follows:
         * > When an inferRefTypesBy... function needs to call inferRefType({..... condExpr:self.expression, crit:{kind:InferCritKind.notnullundef, ...., alsoFailing:true},....})
         * > then it needs to know exactly if the predecessor (and not a prior predecessor to that) has returned a nullish BECAUSE
         * > it is the 'self' expression that carries the questionDotToken between 'sef' and 'self.expression'.  That is reasonable because it is only if the caller ('self')
         * > actually performs a lookup that an error might occurs.  So the error decision must be deferred (* at LEAST) until 'self' processing.
         * > 'self' action pseudocode:
         * >> if preFailing.rtnType is not never
         * >>     if I don't have a 'questionDot' token, then Error (I don't think this decision needs to be deferred but ...)
         * >>     else push `failing.refTypes` to `qdotfallout` - effectively deferring the decision on how to use that until the level "owning" qdotfallout.
         * >> if I have failing lookup on ANY candidate
         * >>     if not `context?nonNullExpression`
         * >>         add {rtnType:undefined, refTypes: refTypes with bySymbol.get(self symbol) lookup value set to `undefined`} to results to results to be passed finally to crit.
         */
        qdotfallout: InferTypeArgsQDotFallout // TODO: should be mandatory
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
