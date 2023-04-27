namespace ts {

    type PropertyKeyType = string;
    const essymbolFloughObjectTypeInstance = Symbol("floughObjectTypeInstance");
    export type FloughObjectTypeInstance = & {
        objectTypeInstanceId: number; // keeps same instance on cloning (for narrowing), but not on merging (unless all merged share same id, this is not yet implemented)
        tsObjectType: ObjectType;
        keyToType: ESMap<PropertyKeyType,RefTypesType>; // instantiated and filled as needed
        [essymbolFloughObjectTypeInstance]: true
    };
    export function isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance {
        return !!x?.[essymbolFloughObjectTypeInstance];
    }
    let nextFloughObjectTypeInstanceId = 1;
    export function createFloughObjectTypeInstance(
        tsObjectType: Readonly<ObjectType>,
        arg1?: Readonly<[PropertyKeyType,RefTypesType][]> | Readonly<ESMap<PropertyKeyType,RefTypesType>>,
        objectTypeInstanceId: number = nextFloughObjectTypeInstanceId++):
        FloughObjectTypeInstance {
        const map = new Map(arg1);
        return { tsObjectType, keyToType: map, objectTypeInstanceId, [essymbolFloughObjectTypeInstance]: true };
    }
    export function cloneFloughObjectTypeInstance(fobj: Readonly<FloughObjectTypeInstance>): FloughObjectTypeInstance {
        return createFloughObjectTypeInstance(fobj.tsObjectType, fobj.keyToType, fobj.objectTypeInstanceId);
    }
    export type FloughLogicalObjectTypePlain = & {
        kind: "plain";
        item: FloughObjectTypeInstance;
    };
    export type FloughLogicalObjectTypeInstanceUnion = & {
        kind: "union";
        items: FloughLogicalObjectTypeInstance[];
    };
    export type FloughLogicalObjectTypeInstanceIntersection = & {
        kind: "intersection";
        items: FloughLogicalObjectTypeInstance[];
    };
    export type FloughLogicalObjectTypeInstance = FloughLogicalObjectTypePlain | FloughLogicalObjectTypeInstanceUnion | FloughLogicalObjectTypeInstanceIntersection;

    type LogicalObjectVisitor<ResultType,StateType> = & {
        onPlain: (logicalObject: Readonly<FloughLogicalObjectTypePlain>) => ResultType;
        onUnion: (logicalObject: Readonly<FloughLogicalObjectTypeInstanceUnion>, result: ResultType, state: StateType) => StateType;
        OnIntersection: (logicalObject: Readonly<FloughLogicalObjectTypeInstanceIntersection>, result: ResultType, state: StateType) => StateType;
        OnItemsInitializeState: () => StateType;
        OnItemsFinished: (state: StateType | undefined) => ResultType;
    };
    function logicalObjecVisit<ArgType, ResultType,StateType>(
        logicalObjectTop: Readonly<FloughLogicalObjectTypeInstance>,
        createVisitor: (arg?: ArgType | undefined) => LogicalObjectVisitor<ResultType,StateType>,
        arg?: ArgType,
    ): ResultType {
        const visitor = createVisitor(arg);
        const stackItemsIndexIdx = 1;
        const stackStateIdx = 2;
        const stack: [logicalObject: Readonly<FloughLogicalObjectTypeInstance>, itemsIndex: number, state: StateType | undefined][]
            = [[logicalObjectTop, 0, undefined]];
        let result: ResultType | undefined;
        while (stack.length!==0) {
            const [logicalObject,itemsIndex,state] = stack[stack.length - 1];
            switch (logicalObject.kind) {
                case "plain": {
                    stack.pop();
                    result = visitor.onPlain(logicalObject);
                    continue;
                }
                case "union":
                case "intersection":
                    if (itemsIndex===logicalObject.items.length){
                        stack.pop();
                    }
                    else if (itemsIndex===0) {
                        stack[stack.length-1][stackStateIdx] = visitor.OnItemsInitializeState();
                        stack[stack.length-1][stackItemsIndexIdx]++;
                        stack.push([logicalObject.items[itemsIndex],0,undefined]);
                    }
                    else {
                        if (logicalObject.kind==="intersection") {
                            stack[stack.length-1][stackStateIdx] = visitor.OnIntersection(logicalObject, result!, state!);
                            stack.push([logicalObject.items[itemsIndex],itemsIndex+1,undefined]);
                        }
                        else {
                            stack[stack.length-1][stackStateIdx] = visitor.onUnion(logicalObject, result!, state!);
                            stack.push([logicalObject.items[itemsIndex],itemsIndex+1,undefined]);
                        }
                        if (itemsIndex===logicalObject.items.length) {
                            result = visitor.OnItemsFinished(state);
                        }
                        else {
                            stack[stack.length-1][stackItemsIndexIdx]++;
                            stack.push([logicalObject.items[itemsIndex],0,undefined]);
                        }
                    }
                    continue;
            }
        }
        return result!;
    }


    /**
     * This is a test function - we really want to get keys and types together, which it a bit more complicated.
     * The resulting set of keys are the zero order result, meaning there is no correlation between the keys - just one set of all keys.
     * @param logicalObjectTop
     */
    export function logicalObjectGetKeysZeroOrder(
        logicalObjectTop: Readonly<FloughLogicalObjectTypeInstance>,
    ): Set<PropertyKeyType> {
        type Result = & {iter: Iterator<PropertyKeyType>, setof: Set<PropertyKeyType> | undefined};
        type State = Set<PropertyKeyType>;
        function createLogicalObjectVisitorForGetKeysZeroOrder():
        LogicalObjectVisitor<Result, State>{
            return {
                onPlain: (logicalObject: Readonly<FloughLogicalObjectTypePlain>) => {
                    const result: Result = { iter: logicalObject.item.keyToType.keys(), setof: undefined };
                    return result;
                },
                onUnion(_logicalObject: Readonly<FloughLogicalObjectTypeInstanceUnion>, result: Result, state: State) {
                    for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                        state.add(it.value);
                    }
                    return state;
                },
                OnIntersection(_logicalObject: Readonly<FloughLogicalObjectTypeInstanceIntersection>, result: Result, state: State) {
                    const setOfKeys = new Set<PropertyKeyType>();
                    for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                        if (state.has(it.value)) setOfKeys.add(it.value);
                    }
                    return setOfKeys;
                },
                OnItemsInitializeState: () => new Set<PropertyKeyType>(),
                OnItemsFinished: (state: State | undefined) => {
                    return { iter: state!.keys(), setof: state };
                }
            };
        }
        const visitor = createLogicalObjectVisitorForGetKeysZeroOrder();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor);
        return result.setof!;
    }

    // export function logicalObjectForEachTypeOfProperyLookup(
    //     logicalObjectTop: Readonly<FloughLogicalObjectTypeInstance>, key: PropertyKeyType, func: (type: Readonly<RefTypesType>) => any
    // ): void {
    // }

}