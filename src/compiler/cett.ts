import {
    TypeChecker,
    // @ts-ignore
    castHereafter,
    Node,
    Type,
    CallExpression,
    CallLikeExpression,
    Expression,
    Debug,
    QualifiedName,
    CheckMode,
    // @ts-ignore
    SymbolFlags,
    // @ts-ignore
    SyntaxKind,
    // @ts-ignore
    SignatureDeclarationBase,
    ResolvedType,
    StructuredType,
    TypeFlags,
    UnionType,
    ObjectType,
    AnonymousType,
    ObjectFlags,
} from "./_namespaces/ts";
// cphdebug-start
import { IDebug } from "./mydebug";
// cphdebug-end

/**
 * Cett will be used to build a type tree structure prior to overload/generic-type resolution.
 * When a call expression (node, type) is added via `addCall`, one of the following will happen
 * - if another preceding call expression references node as a parameter or a return type
 * -   then add the to the tree as a child of the preceding call expression
 * - else the call starts a new tree, and the call is the root of the tree.
 * `addCall` will then call `checkExpression` on all the parameters and the return type,
 * which in the case of overloads/generics should be unresolved.
 * After that, in the case of a root call, the whole tree,
 * including all the sub calls, is ready to be resolved, and resolution is  performed before returning.
 * Note that resolution is done once at the root call for the entire tree, and not at each sub call in the tree.
 * When `addCall` is called for a non-root call, the caller will return `resolvingSignature` (hope that works!).
 * After a root call, the tree is marked as completed, and the results consist of an optimal ensemble of resolved types,
 * where each member of the ensemble includes not only the root call type, but also all the sub call types.
 *
 * Imagine the tree without any type checking, and also the tree where the type checking has pruned branches that are not possible due to type mismatches.
 * The latter can be much smaller without any errors being represent.  So it makes sense to do the type checking
 * before the error reporting.
 *
 * Also, the type checking may be faster if done in compact logic, unencumbered by error reporting.
 *
 * The way TypeScript is written, `resolveCallExpreession` expects to return a single signature,
 * not an ensemble signatures with associated sub-call signatures.
 * We will create a new union signature that includess all of the information, but has a single merged return signature,
 * so that the program can continue to function while modifications are made to make use of the more precise information.
 *
 * Cett does not intend to replace error checking, but it is unavoidable that type mismatches will be detected.
 * If there are no type mismatches, there is a design choice(?):
 * 1. return the special union signature immediately, and figure out how the reflect the tree info into the program state.
 * 2. proceed to chooseOverload etc, looping through the optimal ensemble of signatures for the sake of setting up the program state,
 *    and maybe some special error checking cases.
 *
 * In the case where there are type mismatches, proceed to chooseOverload etc, and report the error(s).
 *
 * When chooseOverload etc are called, the place where `addCall` was called will be reached again, so add call should be able to
 * respond with an "alreadyVisited" result.
 * For an "alreadyVisited" result,
 * - in the case of error processing, proceed to chooseOverload etc, and report the error(s).
 * - otherwise, return the special union signature for the subtree.
 *
 */


export interface CettTypeChecker {
    getEffectiveCallArguments(node: CallLikeExpression): readonly Expression[];
    checkExpression(node: Expression | QualifiedName, checkMode?: CheckMode, forceTuple?: boolean): Type;
    resolveStructuredTypeMembers(type: StructuredType): ResolvedType;
    getReducedApparentType(type: Type): Type;
    getApparentType(type: Type): Type;
    getReducedType(type: Type): Type;

};

export enum AddCallReturnKind {
    alreadyVisited = "alreadyVisited",
    resolvingSignature = "resolvingSignature",
    rootCompleted = "rootCompleted",
};


interface ArgAndType {
    node: Node, type: Type, isTaggedCallExpression?: boolean
};

interface TreeElement {
    node: CallExpression;
    apparentType: Type;
    argsAndTypes: ArgAndType[];
    parentRelationInfo?: ParentRelationInfo | undefined;
}

// We need a map such that downstream call expressions can find their parent and their relationship to parent
interface ParentRelationInfo {
    node: Expression; // key that defines relationship;
    parentCallExpression: CallExpression;
    relation?: number; // -1:parentCallExpression itself, >=0 arg index
}

// interface WaitingInfo {
//     parentCallExpression: CallExpression;
//     childNode: Node; // might not be a call expression at all, or might be an Identifier representing a call expression.
//     argIndex: number; // -1 for return type
// };

// @ts-ignore
function unionForEach(type: Type, callbackfn: (value: Type, index: number) => void): void {
    if (type.flags & TypeFlags.Union) {
        (type as UnionType).types.forEach(callbackfn);
    }
    else {
        callbackfn(type, 0);
    }
}

function dbgCallExpressionTypeToStrings(type: Type): string[] {
    const ret: string[] = [];
    // ret.push(`type.kind:${type.kind}`);
    // ret.push(`type.flags:${type.flags}`);
    // ret.push(`type.symbol:${type.symbol}`);
    // ret.push(`type.escapedText:${type.escapedText}`);
    // ret.push(`type.escapedText:${type.escapedText}`);
    // ret.push(`type.expression:${type.expression}`);
    // ret.push(`type.typeArguments:${type.typeArguments}`);
    // ret.push(`type.typeArguments:${type.typeArguments}`);
    // ret.push(`type.typeArguments:${type.typeArguments}`);
    // ret.push(`type.typeArguments:${type.type
    ret.push(`typeToString: ${IDebug.dbgs.dbgTypeToString(type)}`);
    ret.push(`type.flags: ${Debug.formatTypeFlags(type.flags)}`);
    ret.push(`type.symbol: ${IDebug.dbgs.dbgSymbolToString(type.symbol)}`);
    castHereafter<ObjectType>(type);
    if (type.flags & TypeFlags.Object && (type as ObjectType).objectFlags & (ObjectFlags.Instantiated | ObjectFlags.Anonymous)) {
        ret.push(`type.target: ${IDebug.dbgs.dbgTypeToString((type as AnonymousType).target)}`);
        if ((type as AnonymousType).mapper) {
            ret.push(`type.mapper: ${((type as AnonymousType).mapper! as unknown as Debug.DebugTypeMapper).__debugToString()}`);
        }
    }
    if (type.flags & TypeFlags.Union) {
        (type as UnionType).types.forEach((t, i) => {
            dbgCallExpressionTypeToStrings(t).forEach(s => ret.push(`type.types[${i}]:     ${s}`));
        });
    }
    return ret;
}

export class Cett {
    checker: TypeChecker;
    // May need some functions from TypeChecker that are not in the TypeChecker API.
    // The alternative is to write the code for Cett inside checker.ts, but that would be a mess
    // and very slow to edit.
    cettChecker: CettTypeChecker | undefined;
    //parentCallAndLevel: [CallExpression, number];
    treeElements: Map<CallExpression, TreeElement> = new Map();
    parentRelationInfoMap: Map<Expression, ParentRelationInfo> = new Map();
    //nodeToParentWaitingMap: Map<Node /*child*/, WaitingInfo> = new Map();
    constructor(checker: TypeChecker) {
        this.checker = checker;
        // this.topNode = node;
        // this.parentCallAndLevel = [node, 0];
        // this.checker = checker;
        // this.cettChecker = cettChecker;
        // this.treeByAddCall.set(node, {
        //     kind: TreeElelemntKind.root,
        //     node: node,
        //     type: apparentType,
        //     level: 0,
        //     parentCall: null,
        //     children: []
        // });
    }
    setCettChecker(cettChecker: CettTypeChecker): void {
        if (this.cettChecker) return;
        this.cettChecker = cettChecker;
    }
    addCall(node: CallExpression, funcType: Type): AddCallReturnKind {
        const loggerLevel = 1;
        IDebug.ilogGroup(()=>`addCall[in] node:${IDebug.dbgs.dbgNodeToString(node)}, funcType:${IDebug.dbgs.dbgTypeToString(funcType)}`, loggerLevel);
        const cettChecker = this.cettChecker!;
        // @ts-ignore
        const checker = this.checker;

        // function getResolvedTypes(reducedType: Type): (Type | ResolvedType)[] {
        //     const resolvedTypes: (Type | ResolvedType)[] = [];
        //     unionForEach(reducedType, t=>{
        //         if (t.flags & TypeFlags.StructuredType) resolvedTypes.push(cettChecker.resolveStructuredTypeMembers(t as StructuredType));
        //         else resolvedTypes.push(t);
        //     });
        //     return resolvedTypes;
        // }

        if (this.treeElements.has(node)) {
            // This shouldn't happen
            Debug.assert(false);
            return AddCallReturnKind.alreadyVisited;
        }
        let parentRelationInfo: ParentRelationInfo | undefined;

        if (this.parentRelationInfoMap.size) {
            let p = node.parent;
            while (!parentRelationInfo && p.kind !== SyntaxKind.SourceFile){
                if (this.parentRelationInfoMap.has(p as Expression)){
                    parentRelationInfo = this.parentRelationInfoMap.get(p as Expression);
                }
                else p = p.parent;
            }
            IDebug.ilog(()=>`parentRelationInfo.parentCallExpression:${IDebug.dbgs.dbgNodeToString(parentRelationInfo?.parentCallExpression)}`, loggerLevel);
        }
        const apparentType = cettChecker.getApparentType(funcType);
        const reducedType = cettChecker.getApparentType(cettChecker.getReducedType(apparentType));

        if (IDebug.logLevel<=loggerLevel){
            dbgCallExpressionTypeToStrings(reducedType).forEach(s => IDebug.ilog(()=>`reducedType: ${s}`, loggerLevel));
        }

        IDebug.ilog(()=>`reducedType:${IDebug.dbgs.dbgTypeToString(reducedType)}`, loggerLevel);
        // It may be a union type, show those members too.
        if (reducedType.flags & TypeFlags.Union) {
            (reducedType as UnionType).types.forEach((t, i) => {
                IDebug.ilog(()=>`reducedType.types[${i}]:${IDebug.dbgs.dbgTypeToString(t)}`, loggerLevel);
            });
        }

        // This would resolved the members of each structured type, don't want to do that yet.
        //  const resolvedTypes: ResolvedType[] = getResolvedTypes(reducedType) as ResolvedType[];
        // resolvedTypes.forEach((resolvedType,i)=>{
        //     IDebug.ilog(()=>`resolvedTypes[${i}]:${IDebug.dbgs.dbgTypeToString(resolvedType)}`, loggerLevel);
        // });


        // TODO: if the arg is expanded tuple, it should be flattened first.
        const args = cettChecker.getEffectiveCallArguments(node);
        args.forEach((arg, index) => {
            this.parentRelationInfoMap.set(arg, {parentCallExpression:node, node:arg, relation: index});
        });
        this.parentRelationInfoMap.set(node, {parentCallExpression:node, node, relation: -1});

        const argsAndTypes: ArgAndType[] = [];
        args.forEach((arg, _index) => {
            const type = cettChecker.checkExpression(arg);
            if (!this.treeElements.has(arg as CallExpression)) {
                if (loggerLevel<=IDebug.logLevel){
                    IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}: adding callExpression from addCall`, loggerLevel);
                    // IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}, type:${IDebug.dbgs.dbgTypeToString(type)}`, loggerLevel);
                    // unionForEach(type, (t,uidx)=>{
                    //     if (t!=type) IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}, type[${uidx}]:${IDebug.dbgs.dbgTypeToString(t)}`, loggerLevel);
                    //     if (type.flags & TypeFlags.Object && (type as ObjectType).callSignatures?.length){
                    //         dbgCallExpressionTypeToStrings(reducedType).forEach(s => IDebug.ilog(()=>`reducedType: ${s}`, loggerLevel));
                    //     }
                    // });
                }
                this.addCall(arg as CallExpression, type);
            }
            const argAndType: ArgAndType = {node: arg, type};
            IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}, type:${IDebug.dbgs.dbgTypeToString(type)}`, loggerLevel);
            argsAndTypes.push(argAndType);
        });

        const treeElement: TreeElement = {
            node,
            apparentType: funcType,
            argsAndTypes,
            parentRelationInfo
        };
        this.treeElements.set(node, treeElement);
        const ret: AddCallReturnKind = parentRelationInfo? AddCallReturnKind.resolvingSignature : AddCallReturnKind.rootCompleted;
        IDebug.ilogGroupEnd(()=>`addCall[in] node:${IDebug.dbgs.dbgNodeToString(node)}, has: ${ret}`, loggerLevel);
        return ret;

    }
}

