import {
    TypeChecker,
    castHereafter,
    Node,
    Type,
    CallExpression,
    Debug,
} from "./_namespaces/ts";
// cphdebug-start
import { IDebug } from "./mydebug";
// cphdebug-end

export interface CettTypeChecker {

};

interface TreeElement {
    node: CallExpression;
    type: Type;
    level: number;
    parentCall: Node | null;
    children: TreeElement[];
}

export class Cett {
    checker: TypeChecker;
    cettChecker: CettTypeChecker;
    topNode: Node;
    completed = false;
    parentCallAndLevel: [CallExpression, number];
    treeByAddCall: Map<CallExpression, TreeElement> = new Map();
    constructor(node: CallExpression, apparentType: Type, checker: TypeChecker, cettChecker: CettTypeChecker) {
        this.topNode = node;
        this.parentCallAndLevel = [node, 0];
        this.checker = checker;
        this.cettChecker = cettChecker;
        this.treeByAddCall.set(node, {
            node: node,
            type: apparentType,
            level: 0,
            parentCall: null,
            children: []
        });
    }
    addCall(node: CallExpression, apparentType: Type, callExpressionLevel: number){
        // cphdebug-start
        IDebug.ilog(()=>`addCall: ${IDebug.dbgs.dbgNodeToString(node)}, callExpresionLevel: ${callExpressionLevel}`,2);
        // cphdebug-end
        //let parentCallAndLevel = this.parentCallAndLevel;
        let parentCall = this.parentCallAndLevel[0];
        let parentLevel = this.parentCallAndLevel[1];


        if (parentLevel === callExpressionLevel - 1) {
            // if (parentTreeElement === undefined) {
            //     throw new Error(`parentTreeElement is undefined`);
            // }
            const parentTreeElement = this.treeByAddCall.get(parentCall)!;
            Debug.assert(parentTreeElement);


            const treeElement: TreeElement = {
                node,
                type: apparentType,
                level: callExpressionLevel,
                parentCall,
                children: []
            };
            parentTreeElement.children.push(treeElement);
            this.treeByAddCall.set(node, treeElement);
            this.parentCallAndLevel = [node, callExpressionLevel];
        }
        else if (parentLevel === callExpressionLevel){
            // it is a sibling
            // const parentCallAndLevel = this.parentCallAndLevel;
            // const parentCall = parentCallAndLevel[0];
            // const parentLevel = parentCallAndLevel[1];
            parentCall = parentCall.parent as CallExpression;
            const parentTreeElement = this.treeByAddCall.get(parentCall)!;
            Debug.assert(parentTreeElement);
            parentLevel = parentTreeElement.level;
            const treeElement: TreeElement = {
                node,
                type: apparentType,
                level: callExpressionLevel,
                parentCall,
                children: []
            };
            parentTreeElement.children.push(treeElement);
            this.treeByAddCall.set(node, treeElement);
            this.parentCallAndLevel = [node, callExpressionLevel];
        }
        else {
            Debug.assert(false, `parentLevel: ${parentLevel}, globalCallExpresionLevel: ${callExpressionLevel} not yet implement or error`);
        }

    }
    isCompleted() {
        return this.completed;
    }
    setCompleted() {
        this.completed = true;
    }
}

