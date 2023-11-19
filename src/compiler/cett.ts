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

};

export enum AddCallReturnKind {
    alreadyVisited = "alreadyVisited",
    resolvingSignature = "resolvingSignature",
    rootCompleted = "rootCompleted",
};


enum TreeElementKind {
    root = "root",
    arg = "arg",
    returnType = "returnType",
};

interface ArgAndType {
    node: Node, type: Type, isTaggedCallExpression?: boolean
};

interface TreeElement {
    kind: TreeElementKind;
    node: CallExpression;
    apparentType: Type;
    parentCall: CallExpression | null;
    argsAndTypes: ArgAndType[];
}

interface WaitingInfo {
    parentCallExpression: CallExpression;
    childNode: Node; // might not be a call expression at all, or might be an Identifier representing a call expression.
    argIndex: number; // -1 for return type
};

function unionForEach(type: Type, callbackfn: (value: Type, index: number) => void): void {
    if (type.flags & TypeFlags.Union) {
        (type as UnionType).types.forEach(callbackfn);
    }
    else {
        callbackfn(type, 0);
    }
}

export class Cett {
    checker: TypeChecker;
    // May need some functions from TypeChecker that are not in the TypeChecker API.
    // The alternative is to write the code for Cett inside checker.ts, but that would be a mess
    // and very slow to edit.
    cettChecker: CettTypeChecker | undefined;
    //parentCallAndLevel: [CallExpression, number];
    treeElements: Map<CallExpression, TreeElement> = new Map();
    nodeToParentWaitingMap: Map<Node /*child*/, WaitingInfo> = new Map();
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
    addCall(node: CallExpression, apparentType: Type): AddCallReturnKind {
        IDebug.ilogGroup(()=>`addCall[in] node:${IDebug.dbgs.dbgNodeToString(node)}, apparentType:${IDebug.dbgs.dbgTypeToString(apparentType)}`,2);
        const cettChecker = this.cettChecker!;
        // @ts-ignore
        const checker = this.checker;

        function getResolvedTypes(reducedType: Type): (Type | ResolvedType)[] {
            const resolvedTypes: (Type | ResolvedType)[] = [];
            unionForEach(reducedType, t=>{
                if (t.flags & TypeFlags.StructuredType) resolvedTypes.push(cettChecker.resolveStructuredTypeMembers(t as StructuredType));
                else resolvedTypes.push(t);
            });
            return resolvedTypes;
        }

        if (this.treeElements.has(node)) {
            return AddCallReturnKind.alreadyVisited;
        }
        //let treeKind = TreeElementKind.root;

        const reducedType = cettChecker.getReducedApparentType(apparentType);
        const resolvedTypes: ResolvedType[] = getResolvedTypes(reducedType) as ResolvedType[];
        resolvedTypes.forEach((resolvedType,i)=>{
            IDebug.ilog(()=>`resolvedTypes[${i}]:${IDebug.dbgs.dbgTypeToString(resolvedType)}`,2);
        });


        // TODO: if the arg is expanded tuple, it should be flattened first.
        const args = cettChecker.getEffectiveCallArguments(node); // temporary
        args.forEach((arg, _index) => {
            this.nodeToParentWaitingMap.set(arg, {parentCallExpression:node, childNode:arg, argIndex:_index});
        });

        const parentWaitingInfo = this.nodeToParentWaitingMap.get(node);
        if (parentWaitingInfo){
            const parentTreeElement = this.treeElements.get(parentWaitingInfo.parentCallExpression)!;
            Debug.assert(parentTreeElement);

        }
        if (parentWaitingInfo){
            const parentTreeElement = this.treeElements.get(parentWaitingInfo.parentCallExpression)!;
            Debug.assert(parentTreeElement);
            if (parentWaitingInfo.argIndex === -1){
                Debug.assert(false,"return type not implemented");
                // parentTreeElement.apparentType = apparentType;
                // parentTreeElement.kind = TreeElementKind.returnType;
            }
            else {
                // see if apparent type is a tagged call expression
                IDebug.ilog(()=>``);
                //parentTreeElement.argsAndTypes[parentWaitingInfo.argIndex].isTaggedCallExpression.;
            }
        }

        const argsAndTypes: ArgAndType[] = [];
        args.forEach((arg, _index) => {
            const type = cettChecker.checkExpression(arg, CheckMode.Normal, true);
            const argAndType: ArgAndType = {node: arg, type};
            IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}, type:${IDebug.dbgs.dbgTypeToString(type)}`,2);


            // const symbol = this.checker.getSymbolAtLocation(arg);
            // let isTaggedCallExpression = false;
            // // @ts-ignore
            // let returnsFunction = false;
            // // Might not need to do this here, but rather do it when addCall is called for the child.
            // if (symbol && symbol.flags & SymbolFlags.Function && symbol.declarations && symbol.declarations.length > 0){
            //     symbol.declarations.forEach(decl => {
            //         if (decl.kind === SyntaxKind.CallSignature &&(decl as SignatureDeclarationBase).typeParameters?.length)
            //             isTaggedCallExpression = true;
            //     });
            // }
            // if (isTaggedCallExpression)
            //    argAndType.isTaggedCallExpression = true;
            IDebug.ilog(()=>`idx: ${_index}, arg:${IDebug.dbgs.dbgNodeToString(arg)}, type:${IDebug.dbgs.dbgTypeToString(type)}`,2);
            argsAndTypes.push(argAndType);
        });

        const treeElementKind: TreeElementKind = parentWaitingInfo ?
            (parentWaitingInfo.argIndex === -1 ? TreeElementKind.returnType : TreeElementKind.arg)
            : TreeElementKind.root;

        const treeElement: TreeElement = {
            node,
            apparentType,
            argsAndTypes,
            parentCall: parentWaitingInfo?.parentCallExpression ?? null,
            kind: treeElementKind
        };
        this.treeElements.set(node, treeElement);
        const ret = treeElementKind === TreeElementKind.root ? AddCallReturnKind.rootCompleted : AddCallReturnKind.resolvingSignature;
        IDebug.ilogGroupEnd(()=>`addCall[in] node:${IDebug.dbgs.dbgNodeToString(node)}, ret: ${ret}`,2);
        return ret;

    }
}

